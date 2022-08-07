import * as fs from 'fs';
import {
	Loader, OnLoadResult, Plugin, PluginBuild
} from 'esbuild';

const tsLoader: Loader = 'ts';
const correctNumberOfParts = 2;

const styleUrlsRegExp = /^ *styleUrls *: *\[['"]([^'"\]]*)['"]],*/gm;
const templateUrlRegExp = /^ *templateUrl *: *['"]*([^'"]*)['"]/gm;

function getValueByPattern(regex: RegExp, str: string) {
	const results: Array<string> = [];
	let execArray = regex.exec(str);

	while (execArray !== null) {
		results.push(execArray[1]);
		execArray = regex.exec(str);
	}

	return results.pop();
}

async function removeStyles(contents: string) {
	return contents.replace(styleUrlsRegExp, 'styles: [],');
}

function processConstructor(contents) {
	if (!/constructor *\(([^)]*)/gm.test(contents)) {
		return contents;
	}

	let result = contents;
	const matches = result.matchAll(/constructor *\(([^)]*)/gm);
	// eslint-disable-next-line no-restricted-syntax
	for (const match of matches) {
		if (!match[1] && /:/gm.test(match[1])) {
			continue;
		}

		const flat = match[1].replace(/[\n\r]/gm, '');
		const flatArray = flat.split(',')
			.map((inject) => {
				const parts = inject.split(':');
				const partsCorrect = parts.length === correctNumberOfParts;
				const providerDoesNotContainInject = !/@Inject/.test(inject);
				const shouldAddInject = partsCorrect && providerDoesNotContainInject;
				return shouldAddInject ? `@Inject(${parts[1]}) ${inject}` : inject;
			});

		const constructorRegExp = /constructor *\([^)]*\)/gm;
		result = result.replace(constructorRegExp, `constructor(${flatArray.join(',')})`);
	}

	if (!/Inject[ ,}\n\r].*'@angular\/core.*;/.test(result)) {
		result = `import { Inject } from '@angular/core';\n${result}`;
	}

	return result;
}

async function processComponentMetadata(source: string): Promise<OnLoadResult> {
	try {
		let result = source;

		const hasTemplateUrl = /^ *templateUrl *: *['"]*([^'"]*)/gm.test(result);
		if (hasTemplateUrl) {
			const templateUrl = getValueByPattern(/^ *templateUrl *: *['"]*([^'"]*)/gm, source);
			result = `import templateSource from '${templateUrl}';\n${result}`
				.replace(templateUrlRegExp, 'template: templateSource || ""');
		}

		result = await removeStyles(result || '');
		result = processConstructor(result);

		return { contents: result, loader: tsLoader };
	} catch (e) {
		return { errors: [e] };
	}
}

export function componentMetadataPlugin(): Plugin {
	return {
		name: 'componentMetadataPlugin',
		async setup(build: PluginBuild) {
			build.onLoad({ filter: /src.*\.(component|pipe|service|directive|guard|module)\.ts$/ }, async (args) => {
				const source = await fs.promises.readFile(args.path, 'utf8');
				return await processComponentMetadata(source);
			});
		}
	};
}

import * as fs from 'fs';
import {
	Loader, OnLoadResult, Plugin, PluginBuild
} from 'esbuild';

const tsLoader: Loader = 'ts';

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

async function processComponentMetadata(source: string): Promise<OnLoadResult> {
	try {
		let result = source;
		const hasTemplateUrl = /^ *templateUrl *: *['"]*([^'"]*)/gm.test(result);
		const hasStyleUrls = /^ *styleUrls *: *\[['"]([^'"\]]*)/gm.test(result);

		if (hasTemplateUrl) {
			const templateUrl = getValueByPattern(/^ *templateUrl *: *['"]*([^'"]*)/gm, source);
			result = `import templateSource from '${templateUrl}';\n${result}`
				.replace(templateUrlRegExp, 'template: templateSource || ""');
		}

		if (hasStyleUrls) {
			result = await removeStyles(result || '');
		}

		return { contents: result, loader: tsLoader };
	} catch (e) {
		return { errors: [e] };
	}
}

export function componentMetadataPlugin(): Plugin {
	return {
		name: 'componentMetadataPlugin',
		async setup(build: PluginBuild) {
			build.onLoad({ filter: /.*\.component\.ts$/ }, async (args) => {
				const source = await fs.promises.readFile(args.path, 'utf8');
				return await processComponentMetadata(source);
			});
		}
	};
}

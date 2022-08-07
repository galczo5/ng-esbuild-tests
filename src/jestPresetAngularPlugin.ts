import * as fs from 'fs';
import {
	Loader, OnLoadResult, Plugin, PluginBuild
} from 'esbuild';

const tsLoader: Loader = 'ts';

function processSpecFile(source: string): OnLoadResult {
	try {
		if (!source.includes('import \'jest-preset-angular/setup-jest\'')) {
			const result = `import 'jest-preset-angular/setup-jest';\n${source}`;
			return { contents: result, loader: 'ts' };
		}

		return { contents: source, loader: tsLoader };
	} catch (e) {
		return { errors: [e] };
	}
}

export function jestPresetAngularPlugin(): Plugin {
	return {
		name: 'jestPresetAngularPlugin',
		async setup(build: PluginBuild) {
			build.onLoad({ filter: /.*\.(spec)\.ts$/ }, async (args) => {
				const source = await fs.promises.readFile(args.path, 'utf8');
				return processSpecFile(source);
			});
		}
	};
}

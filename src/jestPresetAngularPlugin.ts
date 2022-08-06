import * as fs from 'fs';
import { Plugin, PluginBuild } from 'esbuild';

function processSpecFile(source: string) {
	try {
		if (!source.includes('import \'jest-preset-angular/setup-jest\'')) {
			const result = `import 'jest-preset-angular/setup-jest';\n${source}`;
			return { contents: result, loader: 'ts' };
		}

		return { contents: source, loader: 'ts' } as any;
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

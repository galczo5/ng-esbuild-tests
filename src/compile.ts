import { build } from 'esbuild';
import { componentMetadataPlugin } from './componentMetadataPlugin';
import { jestPresetAngularPlugin } from './jestPresetAngularPlugin';

export async function compile(
	outDir: string,
	paths: Array<string>,
	usePlugins: boolean
) {
	const start = new Date().getTime();

	const plugins = [];

	if (usePlugins) {
		plugins.push(
			componentMetadataPlugin(),
			jestPresetAngularPlugin()
		);
	}

	const result = await build({
		outdir: outDir,
		entryPoints: paths,
		bundle: true,
		platform: 'node',
		minify: false,
		format: 'iife',
		plugins,
		loader: {
			'.html': 'text'
		}
	});

	const end = new Date().getTime();
	console.log(`\nCompilation end in ${end - start}ms!\n`);

	return result;
}

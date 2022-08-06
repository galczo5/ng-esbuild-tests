import { build } from 'esbuild';

export async function compile(outDir: string, paths: Array<string>) {
	const start = new Date().getTime();

	const result = await build({
		outdir: outDir,
		entryPoints: paths,
		bundle: true,
		sourcemap: true,
		platform: 'node',
		minify: false,
		format: 'iife'
	});

	const end = new Date().getTime();
	console.log(`\nCompilation end in ${end - start}ms!\n`);

	return result;
}

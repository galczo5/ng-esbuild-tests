import { build } from 'esbuild';

const buildPackage = async () => {
	await build({
		entryPoints: ['./src/main.ts'],
		minify: true,
		bundle: true,
		outfile: './index.js',
		platform: 'node',
		external: ['esbuild', 'jest']
	});

	console.log('Bundle ready!');
};

buildPackage()
	.catch((e) => {
		console.error(e);
	});

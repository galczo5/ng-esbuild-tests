import { build } from 'esbuild';
import { promises } from 'fs';

const buildPackage = async () => {
	await build({
		entryPoints: ['./src/main.ts'],
		minify: true,
		bundle: true,
		outfile: './dist/index.js',
		platform: 'node',
		external: ['esbuild', 'jest']
	});

	console.log('Bundle ready!');

	await promises.copyFile('./package.json', './dist/package.json');
	console.log('Package json copied!');

	const indexJs = await promises.readFile('./dist/index.js');
	const scriptContent = `#!/usr/bin/env node\n${indexJs.toString()}`;
	await promises.writeFile('./dist/index.js', scriptContent);
	console.log('Index file ready!');
};

buildPackage()
	.catch((e) => {
		console.error(e);
	});

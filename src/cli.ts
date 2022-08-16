import { program } from 'commander';
import { runCLI } from 'jest';
import { promises } from 'fs';
import { getPaths } from './getPaths';
import { compile } from './compile';

program
	.name('ng-esbuild-tests')
	.description('Run Angular tests faster thanks to Jest and esbuild')
	.option('--dir [dir]', 'directory to scan, default: current directory')
	.option('--pattern [pattern]', 'file pattern, default: ./**/*spec.ts')
	.option('--outDir [outDir]', 'output directory, default: ./dist/ng-esbuild-tests/')
	.option('--skipCompile', 'skip compilation part, only for tests!')
	.option('--experimental', 'use experimental plugins, not necessary if you write tests without TestBed')
	.parse(process.argv);

export async function cli() {
	const opts = program.opts();
	const dir = opts.dir || './';
	const pattern = opts.pattern || '**/*spec.ts';
	const outDir = opts.outDir || './dist/ng-esbuild-tests/';
	const skipCompile = Boolean(opts.skipCompile || '');
	const experimental = Boolean(opts.experimental || '');

	const paths = await getPaths(dir, pattern);

	if (!skipCompile) {
		console.log('Files to compile with esbuild:');
		// eslint-disable-next-line no-restricted-syntax
		for (const path of paths) {
			console.log(`  ${path}`);
		}

		await compile(outDir, paths, experimental);
	} else {
		console.warn('Compilation skipped!');
	}

	const args = `
export default {
	roots: ['./'],
	testRegex: '.spec.js$',
	testEnvironment: 'jsdom'
}`;

	// eslint-disable-next-line no-magic-numbers
	await promises.writeFile('./jest.config.js', JSON.stringify(args, null, 2));

	await runCLI({
		roots: ['./'],
		testRegex: '.spec.js$',
		testEnvironment: 'jsdom'
	} as any, [outDir]);
}

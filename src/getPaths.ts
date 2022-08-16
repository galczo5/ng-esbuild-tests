import { glob } from 'glob';
import { join, resolve } from 'path';

export async function getPaths(dir, patten) {
	return new Promise<Array<string>>((done, reject) => {
		glob(resolve(process.cwd(), join(dir, patten)), (err, files) => {
			if (err) {
				reject(err);
				return;
			}

			done(files);
		});
	});
}

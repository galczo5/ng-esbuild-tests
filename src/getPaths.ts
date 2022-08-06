import { glob } from 'glob';
import { join } from 'path';

export async function getPaths(dir, patten) {
	return new Promise<Array<string>>((resolve, reject) => {
		glob(join(dir, patten), (err, files) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(files);
		});
	});
}

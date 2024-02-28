import zip from 'jszip';

export async function parseZipFromBuffer(buffer) {
	return new Promise((resolve, reject) => {
		zip.loadAsync(buffer).then((zipFile) => {
			resolve(zipFile.files);
		}).catch((e) => {
			reject(e);
		});
	});
}
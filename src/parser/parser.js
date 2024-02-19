import zip from 'jszip';
import { BeatmapDecoder } from 'osu-parsers';

async function parseBuffer(buffer) {
	return new Promise((resolve, reject) => {
		zip.loadAsync(buffer).then((zipFile) => {
			resolve(zipFile.files);
		}).catch((e) => {
			reject(e);
		});
	});
}

const decoder = new BeatmapDecoder();

export async function parseFile(file) {
	console.log('loading .osz file', file);

	const buffer = await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const buffer = e.target.result;
			resolve(buffer);
		}
		reader.onerror = (e) => {
			reject(e);
		}
		reader.readAsArrayBuffer(file);
	}).catch((e) => {
		console.log('error reading file', e);
	});
	if (!buffer) return;
	const zipFile = await parseBuffer(buffer).catch((e) => {
		console.log('error parsing buffer', e);
	});
	if (!zipFile) return;
	
	const fileName = file.name;
	const difficulties = (await Promise.all(
		Object.values(zipFile).filter((file) => {
			return file.name.endsWith('.osu');
		}).map((file) => new Promise((resolve, reject) => {
			file.async('text').then((text) => {
				resolve(text);
			}).catch((e) => {
				reject(e);
			});
		}))
	).catch((e) => {
		console.log('error reading difficulties', e);
	})).map((text) => {
		return decoder.decodeFromString(text);
	}).sort((a, b) => {
		return a.hitObjects.length - b.hitObjects.length;
	});
	return {
		fileName,
		zipFile,
		difficulties
	};

}
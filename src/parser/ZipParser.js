import { parseZipFromBuffer } from '../utils/parseZipFromBuffer';

export async function parseZip(file) {
	console.log('loading .osz file', file);

	// Possible TODO: If the file is identical to the previous one, don't parse it

	const buffer = 
		(file instanceof File) ?
		await new Promise((resolve, reject) => {
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
		}) :
		file;
	if (!buffer) return;
	const zipFile = await parseZipFromBuffer(buffer).catch((e) => {
		console.log('error parsing buffer', e);
	});
	if (!zipFile) return;


	console.log('zipFile', zipFile);
	const fileList = Object.values(zipFile);

	let type = "unknown";
	if (fileList.some((file) => file.name.endsWith('.osu'))) {
		type = "mapPack";
	} else if (
		fileList.some((file) => file.name.trim() === "skin.ini") || 
		fileList.filter((file) => file.name.endsWith('.png') || file.name.endsWith('.svg')).length / fileList.length > 0.5
	) {
		type = "skin";
	}
	return {
		zipFile,
		type
	};
}
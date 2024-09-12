import { BeatmapDecoder } from 'osu-parsers';


const decoder = new BeatmapDecoder();

export async function parseMapPackFromZipFile(zipFile, fileName, preferredDifficulty = null) {
	const beatmaps = (await Promise.all(
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
		console.log('error reading beatmaps', e);
	})).map((text) => {
		return decoder.decodeFromString(text);
	}).sort((a, b) => {
		return a.hitObjects.length - b.hitObjects.length;
	}).map((beatmap) => {
		if (!preferredDifficulty) {
			return beatmap;
		}
		console.log(beatmap.metadata.beatmapId, preferredDifficulty, parseInt(preferredDifficulty));
		if (beatmap.metadata.beatmapId == parseInt(preferredDifficulty)) {
			beatmap.preferredDifficulty = true;
		}
		return beatmap;
	});
	return {
		fileName,
		zipFile,
		beatmaps
	};
}
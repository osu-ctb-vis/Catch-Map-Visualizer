import zip from 'jszip';
import { BeatmapDecoder } from 'osu-parsers';

export function groupAndSortMaps(beatmaps) {
	if (!beatmaps) return [];
	// group by audio file
	const audios = {};
	beatmaps.forEach((beatmap) => {
		const audioFile = beatmap.general.audioFilename;
		if (!audios[audioFile]) audios[audioFile] = [];
		audios[audioFile].push(beatmap);
	});
	const groups = [];
	for (const audio in audios) {
		groups.push({
			name: audio,
			beatmaps: audios[audio]
		});
	}
	// sort by:
	// 1. has ctb > has std > other modes
	// 2. the last difficulty
	const hasCtb = (beatmaps) => beatmaps.some((d) => d.originalMode === 2);
	const hasStd = (beatmaps) => beatmaps.some((d) => d.originalMode === 0);
	groups.sort((a, b) => {
		const aWeight = hasCtb(a.beatmaps) ? 2 : (hasStd(a.beatmaps) ? 1 : 0);
		const bWeight = hasCtb(b.beatmaps) ? 2 : (hasStd(b.beatmaps) ? 1 : 0);
		if (aWeight !== bWeight) return bWeight - aWeight;
		return a.beatmaps.at(-1).hitObjects.length - b.beatmaps.at(-1).hitObjects.length;
	});
	return groups;
}
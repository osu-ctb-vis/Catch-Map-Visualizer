const lineLevels = {
	4: [1, 4, 3, 4, 2, 4, 3, 4],
	3: [1, 4, 3, 4, 2, 4, 3, 4, 1, 4, 3, 4, 2, 4, 3, 4]
};

const parseTimingLines = (beatmap) => {
	// TODO: use mathematical way to avoid traversing all the timing lines
	const timingPoints = beatmap.controlPoints.timingPoints;
	const totalLength = beatmap.totalLength;

	const timingLines = []; // { time, level }


	for (let timingSeg = 0; timingSeg < timingPoints.length; timingSeg++) {
		const startTime = timingPoints[timingSeg].startTime;
		const sig = timingPoints[timingSeg].timeSignature;
		const cycle = lineLevels[sig].length;
		const bpm = timingPoints[timingSeg].bpm;
		const beatLength = 60000 / bpm;
		const levelGap = beatLength / sig / 4;
		//console.log(timingSeg);
		for (let i = 0; ; i++) {
			const time = startTime + i * levelGap;
			if (time > totalLength) break;
			if ((timingSeg + 1 < timingPoints.length) && time >= timingPoints[timingSeg + 1].startTime) break;
			let level = lineLevels[sig][i % cycle];
			timingLines.push({ time, level });
		}
	}
	return timingLines;
}


export const parseHitObjects = (beatmap) => {	
	const timingLines = parseTimingLines(beatmap);

	const hitObjects = beatmap.hitObjects;

	//console.log(timingLines);

	const fruits = [];
	// fruit types: fruit, drop, droplet
	let timingLineIndex = 0;

	
	hitObjects.forEach((hitObject) => {
		const type = hitObject.constructor.name;
		if (type === "HittableObject") {
			fruits.push({
				type: "fruit",
				x: hitObject.startPosition.x,
				time: hitObject.startTime,
				isNewCombo: hitObject.isNewCombo
			});
		} else if (type === "_SlidableObject") {
			const sliderFruits = [];
			sliderFruits.push({
				type: "fruit",
				x: hitObject.startPosition.x,
				time: hitObject.startTime,
				isNewCombo: hitObject.isNewCombo
			});
			sliderFruits.push({
				type: "fruit",
				x: hitObject.path.calculatedPath[hitObject.path.calculatedPath.length - 1].x,
				time: hitObject.endTime,
				isNewCombo: hitObject.isNewCombo
			});
			// Drops
			while (timingLines[timingLineIndex].time < hitObject.startTime) {
				timingLineIndex++;
			}
			const dropLevel = beatmap.difficulty.sliderTickRate;
			for (; timingLineIndex < timingLines.length && timingLines[timingLineIndex].time < hitObject.endTime; timingLineIndex++) {
				const { time, level } = timingLines[timingLineIndex];
				if (level > dropLevel) continue;
				sliderFruits.push({
					type: "drop",
					x: getSliderPointByTime(hitObject, time).x,
					time
				});
			}
			// Droplets
			let dropletSpan = hitObject.duration / (hitObject.repeats + 1);
			if (dropletSpan > 80) {
				while (dropletSpan > 100) dropletSpan /= 2;
				for (let time = hitObject.startTime + dropletSpan; time < hitObject.endTime; time += dropletSpan) {
					sliderFruits.push({
						type: "droplet",
						x: getSliderPointByTime(hitObject, time).x,
						time
					});
				}
			}
			// sort and clean the duplicates
			sliderFruits.sort((a, b) => {
				if (a.time === b.time) {
					const lvla = a.type === "fruit" ? 3 : (a.type === "drop" ? 2 : 1);
					const lvlb = b.type === "fruit" ? 3 : (b.type === "drop" ? 2 : 1);
					return lvlb - lvla;
				}
				return a.time - b.time;
			});
			const sliderFruitsDedup = [];
			for (let i = 0; i < sliderFruits.length; i++) {
				if (i > 0 && sliderFruits[i].time === sliderFruits[i - 1].time) continue;
				sliderFruitsDedup.push(sliderFruits[i]);
			}
			fruits.push(...sliderFruitsDedup);
			console.log(sliderFruitsDedup);
		} else if (type === "todo") {
			
		}

	});
	//console.log(getSliderPointByTime(hitObjects[0], hitObjects[0].startTime + 100));
	return fruits;
}

const getSliderPointByTime = (slider, time) => {
	if (time < slider.startTime || time > slider.endTime) throw new Error("Time out of range");
	const duration = slider.endTime - slider.startTime;
	const repeats = slider.repeats + 1;
	const segDuration = duration / repeats;
	const segIndex = Math.floor((time - slider.startTime) / segDuration);
	const segStartTime = slider.startTime + segIndex * segDuration;
	const percent = segIndex % 2 === 0 ?
		(time - segStartTime) / segDuration :
		1 - (time - segStartTime) / segDuration;
	
	//console.log(time, slider.startTime, segDuration, segIndex, segStartTime, percent);
	
	return getSliderPointByPercent(slider, percent);
}

const getSliderPointByPercent = (slider, percent) => {
	if (!slider.segsPrefixSum) {
		slider.segsPrefixSum = [];
		for (let i = 0; i < slider.path.calculatedPath.length - 1; i++) {
			const dx = slider.path.calculatedPath[i].x - slider.path.calculatedPath[i + 1].x;
			const dy = slider.path.calculatedPath[i].y - slider.path.calculatedPath[i + 1].y;
			slider.segsPrefixSum.push(Math.sqrt(dx * dx + dy * dy) + (slider.segsPrefixSum?.[i - 1] ?? 0));
		}
	}
	const segsPrefixSum = slider.segsPrefixSum;
	const totalLength = segsPrefixSum[segsPrefixSum.length - 1];
	const targetLength = totalLength * percent;
	let l = 0, r = segsPrefixSum.length - 1;
	while (l < r) { // find the last seg with prefix sum <= targetLength
		const mid = Math.floor((l + r) / 2);
		if (segsPrefixSum[mid] <= targetLength) {
			l = mid + 1;
		} else {
			r = mid;
		}
	}
	if (l < segsPrefixSum.length - 1 && segsPrefixSum[l + 1] <= targetLength) l++;
	if (l > 0 && segsPrefixSum[l] > targetLength) l--;
	const index = l;
	const lengthInSeg = targetLength - segsPrefixSum[index];
	const percentInSeg = lengthInSeg / (segsPrefixSum[index + 1] - segsPrefixSum[index]);
	const dx = slider.path.calculatedPath[index + 1].x - slider.path.calculatedPath[index].x;
	const dy = slider.path.calculatedPath[index + 1].y - slider.path.calculatedPath[index].y;
	const x = slider.path.calculatedPath[index].x + dx * percentInSeg;
	const y = slider.path.calculatedPath[index].y + dy * percentInSeg;
	//console.log(index, segsPrefixSum[index], lengthInSeg, percentInSeg, dx, dy, x, y);
	return { x, y };
}
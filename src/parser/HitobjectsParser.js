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
		const levelGap = beatLength / sig / 2;
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
	//const timingLines = parseTimingLines(beatmap);

	const hitObjects = beatmap.hitObjects;

	//console.log(timingLines);

	const fruits = [];
	// fruit types: fruit, drop, droplet
	const difficultyPoints = beatmap.controlPoints.difficultyPoints;
	let difficultyPointIndex = 0;

	
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
			while (difficultyPointIndex < difficultyPoints.length && difficultyPoints[difficultyPointIndex].startTime < hitObject.startTime) {
				difficultyPointIndex++;
			}
			const TickDistanceMultiplier = difficultyPoints[difficultyPointIndex].sliderVelocity;

			const base_scoring_distance = 100;
			const tickDistanceFactor = base_scoring_distance * beatmap.difficulty.sliderMultiplier / beatmap.difficulty.sliderTickRate;
			const tickDistance = tickDistanceFactor * TickDistanceMultiplier;
			const types = {
				'sliderHead': 'fruit',
				'sliderTick': 'drop',
				'sliderRepeat': 'fruit',
				'sliderLegacyLastTick': 'drop',
				'sliderTail': 'fruit'
			}
			let lastEvent = null;
			for (let event of sliderEventGenerator(hitObject.startTime, hitObject.duration, hitObject.velocity, tickDistance, hitObject.path.distance, hitObject.repeats + 1)) {
				if (lastEvent !== null) {
					const sinceLastTick = parseInt(event.time) - parseInt(lastEvent.time);
					if (sinceLastTick > 80) {
						let timeBetweenTiny = sinceLastTick;
						while (timeBetweenTiny > 100) timeBetweenTiny /= 2;
						for (let t = timeBetweenTiny; t < sinceLastTick; t += timeBetweenTiny) {
							fruits.push({
								type: "droplet",
								x: getSliderPointByPercent(
									hitObject,
									lastEvent.pathProgress + (t / sinceLastTick) * (event.pathProgress - lastEvent.pathProgress)
								).x,
								time: t + lastEvent.time
							});
						}
					}
				}
				lastEvent = event;
				if (event.type === "sliderLegacyLastTick") continue;
				fruits.push({
					type: types[event.type],
					x: getSliderPointByPercent(hitObject, event.pathProgress).x,
					time: event.time
				});
			}
			/*sliderFruits.push({
				type: "fruit",
				x: hitObject.startPosition.x,
				time: hitObject.startTime,
				isNewCombo: hitObject.isNewCombo
			});
			sliderFruits.push({
				type: "fruit",
				x: getSliderPointByTime(hitObject, hitObject.endTime).x,
				time: hitObject.endTime
			});
			// Drops
			while (timingLines[timingLineIndex].time < hitObject.startTime) {
				timingLineIndex++;
			}
			const dropLevel = beatmap.difficulty.sliderTickRate;
			for (; timingLineIndex < timingLines.length && timingLines[timingLineIndex].time < hitObject.endTime; timingLineIndex++) {
				const { time, level } = timingLines[timingLineIndex];
				console.log("time, level", time, level, dropLevel, level > dropLevel);
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
				//if (i > 0 && sliderFruits[i].time === sliderFruits[i - 1].time) continue;
				sliderFruitsDedup.push(sliderFruits[i]);
			}
			fruits.push(...sliderFruitsDedup);*/
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
	const baseX = slider.startPosition.x;
	const baseY = slider.startPosition.y;
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
	if (l === segsPrefixSum.length - 1 && l > 0) l--;
	const index = l;
	const lengthInSeg = targetLength - segsPrefixSum[index];
	const segLength = Math.sqrt(
		(slider.path.calculatedPath[index + 1].x - slider.path.calculatedPath[index].x) ** 2 +
		(slider.path.calculatedPath[index + 1].y - slider.path.calculatedPath[index].y) ** 2
	);
	const percentInSeg = lengthInSeg / segLength;
	const dx = slider.path.calculatedPath[index + 1].x - slider.path.calculatedPath[index].x;
	const dy = slider.path.calculatedPath[index + 1].y - slider.path.calculatedPath[index].y;
	const x = slider.path.calculatedPath[index].x + dx * percentInSeg + baseX;
	const y = slider.path.calculatedPath[index].y + dy * percentInSeg + baseY;
	//console.log(index, segsPrefixSum[index], lengthInSeg, percentInSeg, dx, dy, x, y);
	if (isNaN(x) || isNaN(y)) throw new Error("NaN");
	return { x, y };
}


function* sliderEventGenerator(startTime, spanDuration, velocity, tickDistance, totalDistance, spanCount) {
	// From https://github.com/ppy/osu/blob/osu.Game.Rulesets.Catch/Objects/JuiceStream.cs

	tickDistance = Math.max(Math.min(tickDistance, totalDistance), 0);

	const minDistanceFromEnd = velocity * 10;
	yield {
		type: "sliderHead",
		time: startTime,
		pathProgress: 0
	}
	const length = totalDistance;

	if (tickDistance != 0) {
		for (let span = 0; span < spanCount; span++) {
			const spanStartTime = startTime + span * spanDuration;
			const reversed = span % 2 == 1;
			const ticks = [...generateTicks(span, spanStartTime, spanDuration, reversed, length, tickDistance, minDistanceFromEnd)];
			if (reversed) ticks.reverse();
			yield* ticks;

			if (span < spanCount - 1) {
				yield {
					type: "sliderRepeat",
					time: spanStartTime + spanDuration,
					pathProgress: (span + 1) % 2
				}
			}
		}
	}

	const totalDuration = spanCount * spanDuration;

	const finalSpanIndex = spanCount - 1;
	const finalSpanStartTime = startTime + finalSpanIndex * spanDuration;

	const TAIL_LENIENCY = -36;

	const legacyLastTickTime = Math.max(startTime + totalDuration / 2, (finalSpanStartTime + spanDuration) + TAIL_LENIENCY);
	let legacyLastTickProgress = (legacyLastTickTime - finalSpanStartTime) / spanDuration;
	if (spanCount % 2 == 0) legacyLastTickProgress = 1 - legacyLastTickProgress;

	yield {
		type: "sliderLegacyLastTick",
		time: legacyLastTickTime,
		pathProgress: legacyLastTickProgress
	}

	yield {
		type: "sliderTail",
		time: startTime + totalDuration,
		pathProgress: spanCount % 2
	}
}

function* generateTicks(spanIndex, spanStartTime, spanDuration, reversed, length, tickDistance, minDistanceFromEnd) {
	for (let d = tickDistance; d <= length; d += tickDistance) {
		if (d >= length - minDistanceFromEnd) break;

		const pathProgress = d / length;
		const timeProgress = reversed ? 1 - pathProgress : pathProgress;

		yield {
			type: "sliderTick",
			time: spanStartTime + timeProgress * spanDuration,
			pathProgress
		}
	}
}
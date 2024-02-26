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
	const timingPoints = beatmap.controlPoints.timingPoints;
	let timingPointIndex = 0;

	let sliderMultiplier = 1;
	if (difficultyPoints[0].sliderVelocity) {
		sliderMultiplier = difficultyPoints[0].sliderVelocity;
	}
	
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
			while (timingPointIndex < timingPoints.length - 1 && timingPoints[timingPointIndex + 1].startTime < hitObject.startTime) {
				timingPointIndex++;
			}
			const timingPoint = timingPoints[timingPointIndex];
			while (difficultyPointIndex < difficultyPoints.length - 1 && difficultyPoints[difficultyPointIndex + 1].startTime < hitObject.startTime) {
				difficultyPointIndex++;
				if (difficultyPoints[difficultyPointIndex].sliderVelocity) {
					sliderMultiplier = difficultyPoints[difficultyPointIndex].sliderVelocity;
				}
			}
			const base_scoring_distance = 100;
			const TickDistanceMultiplier = beatmap.fileFormat < 8 ? 1 : sliderMultiplier; //
			const velocityFactor = base_scoring_distance * beatmap.difficulty.sliderMultiplier / timingPoint.beatLength;
			const tickDistanceFactor = base_scoring_distance * beatmap.difficulty.sliderMultiplier / beatmap.difficulty.sliderTickRate;

			//console.log("tickDistanceFactor, TickDistanceMultiplier", tickDistanceFactor, TickDistanceMultiplier);
			
			const tickDistance = tickDistanceFactor * TickDistanceMultiplier;
			//const velocity = velocityFactor * sliderMultiplier;
			const velocity = hitObject.velocity;
			//console.log("velocityFactor", velocityFactor, "sliderMultiplier", sliderMultiplier, "velocity", velocity);
			const duration = (hitObject.repeats + 1) * hitObject.path.distance / velocity;
			const types = {
				'sliderHead': 'fruit',
				'sliderTick': 'drop',
				'sliderRepeat': 'fruit',
				'sliderLegacyLastTick': 'drop',
				'sliderTail': 'fruit'
			}
			let lastEvent = null;
			for (let event of sliderEventGenerator(
				hitObject.startTime,
				hitObject.spanDuration,
				velocity,
				tickDistance,
				hitObject.path.distance,
				hitObject.repeats + 1
			)) {
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
			if (fruits[fruits.length - 1].time > hitObject.endTime) {
			//	throw new Error("Slider end time is less than last fruit time");
			}
		} else if (type === "SpinnableObject") {
			let startTime = parseInt(hitObject.startTime);
			let endTime = parseInt(hitObject.endTime);
			let spacing = endTime - startTime;
			while (spacing > 100) spacing /= 2;
			if (spacing < 0) return;

			let count = 0;
			for (let t = startTime; t <= endTime; t += spacing) {
				fruits.push({
					type: "banana",
					x: 512 * Math.random(),	 // TODO: use legacy constant RNG
					time: t,
					bananaIndex: count
				});
				count++;
			}			
		}

	});
	fruits.sort((a, b) => a.time - b.time); // sort again because some maps have simultaneous hitobjects
	return fruits;
}


const getSliderPointByPercent = (slider, percent) => {
	const baseX = slider.startPosition.x;
	const baseY = slider.startPosition.y;
	if (!slider.segsPrefixSum) {
		slider.segsPrefixSum = [0];
		for (let i = 1; i < slider.path.calculatedPath.length; i++) {
			const dx = slider.path.calculatedPath[i].x - slider.path.calculatedPath[i - 1].x;
			const dy = slider.path.calculatedPath[i].y - slider.path.calculatedPath[i - 1].y;
			slider.segsPrefixSum.push(Math.sqrt(dx * dx + dy * dy) + slider.segsPrefixSum[i - 1]);
		}
	}
	const segsPrefixSum = slider.segsPrefixSum;
	const totalLength = segsPrefixSum[segsPrefixSum.length - 1];
	const targetLength = totalLength * percent;
	let l = 0, r = segsPrefixSum.length - 1;
	while (l < r) {
		const mid = Math.floor((l + r) / 2);
		if (segsPrefixSum[mid] < targetLength) {
			l = mid + 1;
		} else {
			r = mid;
		}
	}
	if (segsPrefixSum[l] > targetLength) l--;
	
	const index = Math.min(l, segsPrefixSum.length - 2);
	const lengthInSeg = targetLength - segsPrefixSum[index];
	const segLength = (segsPrefixSum[index + 1] ?? totalLength) - segsPrefixSum[index];
	if (segLength === 0) throw new Error('segLength is 0');
	const percentInSeg = lengthInSeg / segLength;
	const dx = slider.path.calculatedPath[index + 1].x - slider.path.calculatedPath[index].x;
	const dy = slider.path.calculatedPath[index + 1].y - slider.path.calculatedPath[index].y;
	const x = slider.path.calculatedPath[index].x + dx * percentInSeg + baseX;
	const y = slider.path.calculatedPath[index].y + dy * percentInSeg + baseY;
	
	if (isNaN(x) || isNaN(y)) throw new Error('NaN');
	return { x, y };
}


function* sliderEventGenerator(startTime, spanDuration, velocity, tickDistance, totalDistance, spanCount) {
	console.log(startTime, spanDuration, velocity, tickDistance, totalDistance, spanCount);
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
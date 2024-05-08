import { LegacyRandom } from '../utils/LegacyRandom.js';
import { CalculateScaleFromCircleSize, calculateScale, CalculateCatchWidthByScale, CalculateCatchWidth, ALLOWED_CATCH_RANGE } from '../utils/CalculateCSScale.js';

// const lineLevels = {
// 	4: [1, 4, 3, 4, 2, 4, 3, 4],
// 	3: [1, 4, 3, 4, 2, 4, 3, 4, 1, 4, 3, 4, 2, 4, 3, 4]
// };

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

const getHitObjectType = (hitObject) => {
	const hitType = hitObject.hitType;
	if (hitType & 1) return "HittableObject"; 
	if (hitType & 1 << 1) return "_SlidableObject";
	if (hitType & 1 << 3) return "SpinnableObject";
}

export const parseHitObjects = (beatmap, hardRock, easy, gameSpeed) => {
	//const timingLines = parseTimingLines(beatmap);

	const hitObjects = beatmap.hitObjects;

	//console.log(timingLines);

	const nestedFruits = [];
	// fruit types: fruit, drop, droplet
	const difficultyPoints = beatmap.controlPoints.difficultyPoints;
	let difficultyPointIndex = 0;
	const timingPoints = beatmap.controlPoints.timingPoints;
	let timingPointIndex = 0;

	let sliderMultiplier = 1;
	if (difficultyPoints[0]?.sliderVelocity) {
		sliderMultiplier = difficultyPoints[0].sliderVelocity;
	}
	console.log(hitObjects);
	
	hitObjects.forEach((hitObject) => {
		const type = getHitObjectType(hitObject);
		if (type === "HittableObject") {
			nestedFruits.push({
				type: "fruit",
				fruits: [{
					type: "fruit",
					x: hitObject.startPosition.x,
					time: hitObject.startTime,
					isNewCombo: hitObject.isNewCombo
				}]
			});
		} else if (type === "_SlidableObject") {
			while (timingPointIndex < timingPoints.length - 1 && timingPoints[timingPointIndex + 1].startTime < hitObject.startTime) {
				timingPointIndex++;
			}
			const timingPoint = timingPoints[timingPointIndex];
			while (difficultyPointIndex < difficultyPoints.length - 1 && difficultyPoints[difficultyPointIndex + 1].startTime <= hitObject.startTime) {
				difficultyPointIndex++;
				if (difficultyPoints[difficultyPointIndex].sliderVelocity) {
					sliderMultiplier = difficultyPoints[difficultyPointIndex].sliderVelocity;
				}
			}
			const base_scoring_distance = 100;
			const TickDistanceMultiplier = beatmap.fileFormat < 8 ? 1 : sliderMultiplier;
			const velocityFactor = base_scoring_distance * beatmap.difficulty.sliderMultiplier / timingPoint.beatLength;
			const tickDistanceFactor = base_scoring_distance * beatmap.difficulty.sliderMultiplier / beatmap.difficulty.sliderTickRate;

			//console.log("tickDistanceFactor, TickDistanceMultiplier", tickDistanceFactor, TickDistanceMultiplier);

			//console.log("time, TickDistanceMultiplier", hitObject.startTime, TickDistanceMultiplier, difficultyPointIndex, difficultyPoints[difficultyPointIndex]);
			
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
			const objs = [];
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
							objs.push({
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
				objs.push({
					type: types[event.type],
					x: getSliderPointByPercent(hitObject, event.pathProgress).x,
					time: event.time
				});
			}
			if (objs[objs.length - 1].time > hitObject.endTime) {
				throw new Error("Slider end time greater than hitObject end time");
			}
			nestedFruits.push({ type: "juiceStream", fruits: objs });
		} else if (type === "SpinnableObject") {
			let startTime = parseInt(hitObject.startTime);
			let endTime = parseInt(hitObject.endTime);
			let spacing = endTime - startTime;
			while (spacing > 100) spacing /= 2;
			if (spacing < 0) return;

			const objs = [];

			let count = 0;
			for (let t = startTime; t <= endTime; t += spacing) {
				objs.push({
					type: "banana",
					x: 512 * Math.random(),	 // TODO: use legacy constant RNG
					time: t,
					bananaIndex: count
				});
				if (spacing === 0) break;
				count++;
			}
			nestedFruits.push({ type: "bananaShower", fruits: objs });
		}

	});
	applyVisualPresentation(nestedFruits);
	applyPositionOffsets(nestedFruits);
	applyHyperFruits(nestedFruits, beatmap, hardRock, easy, gameSpeed);
	const fruits = nestedFruits.flatMap((nested) => nested.fruits);
	fruits.sort((a, b) => a.time - b.time); // sort again because some maps have simultaneous hitobjects
	return fruits;
}

const applyVisualPresentation = (nestedFruits) => {
	const fruits = nestedFruits.filter((nested) => nested.type !== "bananaShower");
	const types = ["pear", "grape", "pineapple", "raspberry"];
	for (let i = 0; i < fruits.length; i++) {
		const curTyoe = types[i % types.length];
		for (let fruit of fruits[i].fruits) {
			fruit.visualType = curTyoe;
		}
	}
}

const applyPositionOffsets = (nestedFruits) => {
	const RNG_SEED = 1337;
	let rng = new LegacyRandom(RNG_SEED), rngHR = new LegacyRandom(RNG_SEED);

	let lastPosition = null, lastStartTime = 0;

	let nestedIndex = -1;
	let index = -1;

	for (let fruit of nestedFruits) {
		nestedIndex++;
		//console.log(fruit);
		if (fruit.type === "fruit") { // HR Offset
			index++;
			const hitObject = fruit.fruits[0];

			const offsetPosition = hitObject.OriginalX;
			const startTime = hitObject.StartTime;

			if (lastPosition == null) {
				lastPosition = offsetPosition;
				lastStartTime = startTime;
				continue;
			}

			const positionDiff = offsetPosition - lastPosition;
			// Original comment: Todo: BUG!! Stable calculated time deltas as ints, which affects randomisation. This should be changed to a double.
			const timeDiff = startTime - lastStartTime; 

			if (timeDiff > 1000) {
				lastPosition = offsetPosition;
				lastStartTime = startTime;
				continue;
			}

			if (positionDiff == 0) {
				hitObject.xOffsetHR = getRandomOffset(position, timeDiff / 4, rngHR);
				continue;
			}

			if (Math.abs(positionDiff) < timeDiff / 3) {
				hitObject.xOffsetHR += getOffset(offsetPosition + (hitObject.xOffset ?? 0), positionDiff);
			}

			lastPosition = offsetPosition;
			lastStartTime = startTime;
		} else if (fruit.type === "bananaShower") {
			for (let banana of fruit.fruits) {
				index++;
				const tmp = rng.nextDouble();
				//console.log("banana", tmp, nestedIndex, index);
				banana.x = tmp * 512;
				rng.next(); rng.next(); rng.next();
				banana.xOffsetHR = rngHR.nextDouble() * 512 - banana.x;
				rngHR.next(); rngHR.next(); rngHR.next();
			}
		} else if (fruit.type === "juiceStream") {
			// Original comment: Todo: BUG!! Stable used the last control point as the final position of the path, but it should use the computed path instead.
			lastPosition = fruit.fruits.at(-1).x;
			// Original comment: Todo: BUG!! Stable attempted to use the end time of the stream, but referenced it too early in execution and used the start time instead.
			lastStartTime = fruit.fruits[0].time;

			for (let subFruit of fruit.fruits) {
				index++;
				if (subFruit.type === "droplet") {
					const tmp = rng.nextRange(-20, 20);
					//console.log(tmp, nestedIndex, index);
					subFruit.xOffset = clamp(tmp, -subFruit.x, 512 - subFruit.x);
					subFruit.xOffsetHR = clamp(rngHR.nextRange(-20, 20), -subFruit.x, 512 - subFruit.x);
				} else if (subFruit.type === "drop") {
					//console.log("pass (drop)", nestedIndex, index);
					rng.next(); rngHR.next();
				}
			}
		}
	}
}

const clamp = (value, min, max) => {
	if (min > max) {
		const temp = min;
		min = max;
		max = temp;
	}
	return Math.min(Math.max(value, min), max);
}

const getRandomOffset = (position, maxOffset, rng) => {
	const right = rng.nextBool();
	const rand = Math.Min(20, rng.next(0, Math.Max(0, maxOffset)));

	if (right) {
		if (position + rand <= 512) return rand
		else return -rand;
	} else {
		if (position - rand >= 0) return -rand;
		else return rand;
	}
}
const getOffset = (position, amount) => {
	if (amount > 0) {
		if (position + amount < 512) return amount;
		return 0;
	} else {
		if (position - amount > 0) return amount;
		return 0;
	}
}
const applyHyperFruits = (nestedFruits, beatmap, hardRock, easy, gameSpeed) => {
	const palpableObjects = nestedFruits.flatMap((nested) => nested.fruits).filter(h => h.type === "fruit" || h.type === "droplet");
	let halfCatcherWidth = CalculateCatchWidth(beatmap.difficulty, hardRock, easy) / 2;
	halfCatcherWidth /= ALLOWED_CATCH_RANGE;
	let lastDirection = 0;
	let lastExcess = halfCatcherWidth;
	
	const BASE_DASH_SPEED = 1.0 / gameSpeed;

	for (let i = 0; i < palpableObjects.length - 1; i++) {
		const currentObject = palpableObjects[i];
		const nextObject = palpableObjects[i + 1];
		currentObject.hyperDashTarget = null;
		currentObject.distanceToHyperDash = 0;

		const thisDirection = nextObject.x > currentObject.x ? 1 : -1;
		const timeToNext = nextObject.time - currentObject.time - 1000 / 60 / 4;
		const distanceToNext = Math.abs(nextObject.x - currentObject.x) - (lastDirection === thisDirection ? lastExcess : halfCatcherWidth);
		const distanceToHyper = timeToNext * BASE_DASH_SPEED - distanceToNext;

		if (distanceToHyper < 0) {
			currentObject.hyperDashTarget = nextObject;
			const timeDiff = nextObject.time - currentObject.time;
			const xDiff = Math.abs(nextObject.x - currentObject.x);
			const velocity = xDiff / Math.max(1, timeDiff - 1000.0 / 60.0);
			currentObject.hyperMultiplier = velocity / BASE_DASH_SPEED;
			lastExcess = halfCatcherWidth;
		} else {
			currentObject.distanceToHyperDash = distanceToHyper;
			lastExcess = clamp(distanceToHyper, 0, halfCatcherWidth);
		}

		lastDirection = thisDirection;
	}
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
	
	const index = Math.max(Math.min(l, segsPrefixSum.length - 2), 0);
	const lengthInSeg = targetLength - segsPrefixSum[index];
	const segLength = (segsPrefixSum[index + 1] ?? totalLength) - segsPrefixSum[index];
	if (segLength === 0) return { x: baseX + slider.path.calculatedPath[index].x, y: baseY + slider.path.calculatedPath[index].y };
	const percentInSeg = lengthInSeg / segLength;
	const dx = slider.path.calculatedPath[index + 1].x - slider.path.calculatedPath[index].x;
	const dy = slider.path.calculatedPath[index + 1].y - slider.path.calculatedPath[index].y;
	const x = slider.path.calculatedPath[index].x + dx * percentInSeg + baseX;
	const y = slider.path.calculatedPath[index].y + dy * percentInSeg + baseY;
	
	if (isNaN(x) || isNaN(y)) throw new Error('NaN');
	return { x, y };
}


function* sliderEventGenerator(startTime, spanDuration, velocity, tickDistance, totalDistance, spanCount) {
	//console.log(startTime, spanDuration, velocity, tickDistance, totalDistance, spanCount);
	// From https://github.com/ppy/osu/blob/2889cf39d72b1c00d0b03ba5bcf094732da7f5b4/osu.Game.Rulesets.Catch/Objects/JuiceStream.cs

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
	//console.log("generateTicks", spanIndex, spanStartTime, spanDuration, reversed, length, tickDistance, minDistanceFromEnd);
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
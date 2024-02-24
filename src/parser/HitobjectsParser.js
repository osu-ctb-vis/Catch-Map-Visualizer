export const parseHitObjects = (beatmap) => {
	const timing = beatmap.controlPoints.timingPoints;
	const hitObjects = beatmap.hitObjects;
	
	let currentTimingSeg = 0;
	let currentTimingPoint = timing[currentTimingSeg].startTime;
	let currentTickCount = 0;

	const nextTimingPoint = () => {
		currentTimingSeg++;
	}

	const fruits = [];
	// fruit types: fruit, drop, droplet
	
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
			// Lets just defer this for now
		} else if (type === "todo") {
			
		}

	});
	return fruits;
}

const getBezierPoint = (controlPoints, t) => {
	let res = { x: 0, y: 0 };
	const n = controlPoints.length - 1;
	for (let i = 0; i <= n; i++) {
		const { x, y } = controlPoints[i];
		const b = C(n, i) * Math.pow(1 - t, n - i) * Math.pow(t, i);
		res.x += x * b;
		res.y += y * b;
	}
	return {x, y};
}

const CMemo = { '1,1': 1 };
for (let n = 2; n <= 20; n++) {
	CMemo[`${n},0`] = 1;
	CMemo[`${n},${n}`] = 1;
	for (let k = 1; k < n; k++) {
		CMemo[`${n},${k}`] = (CMemo[`${n-1},${k-1}`] || 0) + (CMemo[`${n-1},${k}`] || 0);
	}
}
const C = (n, k) => {
	if (k < 0 || k > n) return 0;
	if (k === 0 || k === n) return 1;
	if (CMemo[`${n},${k}`]) return CMemo[`${n},${k}`];
	const result = factorial(n) / (factorial(k) * factorial(n - k));
	CMemo[`${n},${k}`] = result;
	return result;
}
const factorial = (n) => {
	let result = 1;
	for (let i = 2; i <= n; i++) {
		result *= i;
	}
	return result;
}

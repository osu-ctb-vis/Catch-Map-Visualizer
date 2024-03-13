import { CalculateCatchWidthByCircleSize, ALLOWED_CATCH_RANGE } from '../utils/CalculateCSScale.js';
import { calculatePreempt } from "../utils/ApproachRate";

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const WALK_SPEED = 0.5;
const DASH_SPEED = 1.0;

export const calculateAutoPath = async (
	fruits,
	circleSize,
	approachRate,
	hardRock,
	easy,
	derandomize,
	gameSpeed,
	wasmInstance = null,
) => {
	const walkSpeed = WALK_SPEED / gameSpeed;
	const dashSpeed = DASH_SPEED / gameSpeed;

	const originalXs = fruits.map(fruit => fruit.x);
	fruits = fruits.map(fruit => {
		if (derandomize && fruit.type != "banana") return fruit;
		if (hardRock) fruit.x += (fruit?.xOffsetHR ?? 0);
		else fruit.x += fruit?.xOffset ?? 0;
		return fruit;
	});

	//console.log(fruits);

	const path = [{
		fromTime: -1,
		toTime: 0,
		holdToTime: 0,
		fromX: 256,
		toX: 256,
	}];

	if (hardRock) circleSize = Math.min(10, circleSize * 1.3);
	if (easy) circleSize = circleSize * 0.5;

	if (hardRock) approachRate = Math.min(10, approachRate * 1.4);
	if (easy) approachRate = approachRate * 0.5;
	
	const preempt = calculatePreempt(approachRate) / gameSpeed;

	let halfCatcherWidth = CalculateCatchWidthByCircleSize(circleSize) / 2;
	halfCatcherWidth /= ALLOWED_CATCH_RANGE;

	if (wasmInstance) {
		const bananas = new wasmInstance.vector$int$();
		let cur = 0;
		for (let i = 0; i < fruits.length; i++) {
			if (fruits[i].type === "banana") {
				cur++;
			} else {
				if (cur) {
					bananas.push_back(cur);
					cur = 0;
				}
			}
		}
		if (cur) bananas.push_back(cur);
		wasmInstance.initBananas(bananas);
	}

	
	for (let i = 0; i < fruits.length; i++) {
		if (fruits[i].type === "fruit" || fruits[i].type === "drop" || fruits[i].type === "droplet") {
			const speeds = [{hyper: false, speed: walkSpeed}, {hyper: false, speed: dashSpeed}];
			if (fruits[i].hyperDashTarget) {
				const hyperMultiplier = fruits[i].hyperMultiplier;
				speeds.push({hyper: false, speed: walkSpeed * hyperMultiplier});
				speeds.push({hyper: true, speed: dashSpeed * hyperMultiplier});
			}

			const prevX = path[path.length - 1].toX;
			const prevTime = path[path.length - 1].holdToTime;
			const x = fruits[i].x;
			const time = fruits[i].time;
			const distance = x - prevX;
			const duration = time - prevTime;
			const requiredSpeed = Math.abs(distance / duration);

			speeds.sort((a, b) => a.speed - b.speed);
			
			speeds.push({hyper: requiredSpeed > dashSpeed, speed: Math.abs(requiredSpeed)});

			let possible = false;
			for (const {hyper, speed} of speeds) {
				if (requiredSpeed <= speed) {
					const actualDuration = Math.abs(distance / speed);
					const idealStartTime = clamp(time - preempt, prevTime, time - actualDuration);
					const wait = idealStartTime - prevTime;
					path[path.length - 1].holdToTime += wait;
					path.push({
						fromTime: prevTime + wait,
						toTime: prevTime + actualDuration + wait,
						holdToTime: time,
						fromX: prevX,
						toX: x,
						hyper,
					});
					possible = true;
					break;
				}
			}
			if (possible) continue;

			/*if (!possible) {
				impossibleCount++;
				console.log("Impossible", fruits[i], fruits[i - 1], speed, speeds);
			}*/
		} else if (fruits[i].type === "banana") {
			const bananas = [];
			if (path.length && i > 0) {
				bananas.push({
					type: "snap",
					x: path[path.length - 1].toX,
					time: path[path.length - 1].holdToTime
				});
			}
			while (i < fruits.length && fruits[i].type === "banana") {
				bananas.push(fruits[i]);
				i++;
			}
			if (i < fruits.length) {
				bananas.push({
					type: "snap",
					x: fruits[i].x,
					time: fruits[i].time
				});
			}
			i--;
			const bestPath = wasmInstance ?
				await calculateBananaPathWasm(bananas, halfCatcherWidth, gameSpeed, wasmInstance) :
				calculateFallbackBananaPath(bananas);
			//console.log(bestPath[0], path[path.length - 1]);
			path.push(...bestPath);
		}
	}

	const missedBananas = [];

	// recover originalXs
	for (let i = 0; i < fruits.length; i++) {
		fruits[i].x = originalXs[i];
		if (fruits[i].bananaMissed) missedBananas.push(i);
	}

//	console.log(path);
	return {
		path,
		missedBananas,
	};
}

let wasmInstance = null, wasmModule = null;

export const initWasm = async () => {
	wasmModule = (await import('./banana-path-calculation/banana-path-calc.js')).default;
	wasmInstance = await wasmModule();
	let ping = wasmInstance.cwrap('ping', 'string', []);


	console.log(ping()); // Check if the WASM module is loaded
	
	return wasmInstance;
}

const calculateBananaPathWasm = async (bananas, halfCatcherWidth, gameSpeed, wasmInstance) => {
	console.log("Calculating banana path with WASM");
	const timeBefore = performance.now();

	const walkSpeed = WALK_SPEED / gameSpeed;
	const dashSpeed = DASH_SPEED / gameSpeed;
	
	halfCatcherWidth *= 0.8; // leniency
	const headSnap = bananas[0].type === "snap";
	const tailSnap = bananas[bananas.length - 1].type === "snap";
	
	console.log(wasmInstance);
	console.log(bananas, headSnap, tailSnap, halfCatcherWidth);

	const vec = new wasmInstance.vector$Banana$();
	bananas.forEach(banana => vec.push_back(banana));

	let outputObj = await wasmInstance.calculatePath(vec, headSnap, tailSnap, halfCatcherWidth, gameSpeed);
	let size = outputObj.size();

	console.log(outputObj);

	const result = [];
	for (let i = 0; i < size; i++) {
		const cur = outputObj.get(i);
		result.push(cur);
	}

	outputObj.delete();

	const path = [];
	for (let i = 0; i < result.length - 1; i++) {
		const cur = result[i], nxt = result[i + 1];
		const dist = Math.abs(cur.x - nxt.x);
		const time = Math.abs(cur.time - nxt.time);
		let speed = dist / time;
		if (speed < walkSpeed) speed = walkSpeed;
		else if (speed < dashSpeed) speed = dashSpeed;
		const actualDuration = dist / speed;
		path.push({
			fromTime: cur.time,
			toTime: cur.time + actualDuration,
			holdToTime: nxt.time,
			fromX: cur.x,
			toX: nxt.x,
			hyper: false,
			banana: true,
		});
	}
	// backwrite banana
	for (let o in bananas) {
		delete bananas[o].bananaMissed;
	}
	for (let i = 0; i < result.length; i++) {
		const cur = result[i];
		if (bananas[cur.index].type === "banana") {
			bananas[cur.index].bananaCatched = true;
		}
	}
	for (let o in bananas) {
		if (bananas[o].type === "banana" && !bananas[o].bananaCatched) {
			bananas[o].bananaMissed = true;
		}
	}
	console.log("banana path calculated in", performance.now() - timeBefore, "ms");
	return path;	
}

const calculateFallbackBananaPath = (bananas) => {
	// This one simply catches all bananas bypassing the speed limit
	const path = [];
	for (let i = 0; i < bananas.length - 1; i++) {
		const cur = bananas[i], nxt = bananas[i + 1];
		const dist = Math.abs(cur.x - nxt.x);
		const time = Math.abs(cur.time - nxt.time);
		const speed = dist / time;
		const actualDuration = dist / speed;
		path.push({
			fromTime: cur.time,
			toTime: cur.time + actualDuration,
			holdToTime: nxt.time,
			fromX: cur.x,
			toX: nxt.x,
			hyper: false,
			banana: true,
		});
	}
	return path;
}
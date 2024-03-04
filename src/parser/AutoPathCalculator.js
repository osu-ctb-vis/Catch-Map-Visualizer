import { CalculateCatchWidthByCircleSize, ALLOWED_CATCH_RANGE } from '../utils/CalculateCSScale.js';

const walkSpeed = 0.5;
const dashSpeed = 1.0;

export const calculateAutoPath = (fruits, beatmap, hardRock, easy, derandomize) => {
	fruits = fruits.map(fruit => {
		if (derandomize && fruit.type != "banana") return fruit;
		if (hardRock) fruit.x += fruit?.xOffsetHR ?? 0;
		else fruit.x += fruit?.xOffset ?? 0;
		return fruit;
	});

	console.log(fruits);

	const path = [{
		fromTime: -1,
		toTime: 0,
		holdToTime: 0,
		fromX: 256,
		toX: fruits[0].x,
	}];

	let CS = beatmap.difficulty.circleSize;
	if (hardRock) CS = Math.min(10, CS * 1.3);
	if (easy) CS = CS * 0.5;

	let impossibleCount = 0;

	let halfCatcherWidth = CalculateCatchWidthByCircleSize(CS) / 2;
	halfCatcherWidth /= ALLOWED_CATCH_RANGE;
	
	for (let i = 0; i < fruits.length; i++) {
		if (fruits[i].type === "fruit" || fruits[i].type === "drop" || fruits[i].type === "droplet") {
			const speeds = [{hyper: false, speed: walkSpeed}, {hyper: true, speed: dashSpeed}];
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
			const direction = Math.sign(distance);
			const duration = time - prevTime;
			const speed = Math.abs(distance / duration);

			speeds.push({hyper: false, speed: Math.abs(speed)});
			speeds.sort((a, b) => a.speed - b.speed);

			let possible = false;
			for (const {hyper, speed: targetSpeed} of speeds) {
				if (speed <= targetSpeed) {
					const actualDuration = Math.abs(distance / targetSpeed);
					path.push({
						fromTime: prevTime,
						toTime: prevTime + actualDuration,
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
					time: fruits[i - 1].toTime
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
			const bestPath = calculateBestBananaPath(bananas);
			path.push(...bestPath);
		}
	}

	console.log(path);
	return path;
}

const calculateBestBananaPath = (bananas) => {
	return [];
}
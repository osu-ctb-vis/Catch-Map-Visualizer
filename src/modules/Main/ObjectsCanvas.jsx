import { useEffect, useRef, useLayoutEffect, useState, useContext, useMemo, useCallback } from "react";
import { SettingsContext } from "../../contexts/SettingsContext";
import "./ObjectsCanvas.scss";
import { calculatePreempt } from "../../utils/ApproachRate";
import { parseHitObjects } from "../../parser/HitobjectsParser";
import { PlayStateContext } from "../../contexts/PlayStateContext";
import { CalculateScaleFromCircleSize } from "../../utils/CalculateCSScale";
import useRefState from "../../hooks/useRefState";

export function ObjectsCanvas({ beatmap }) {
	const ref = useRef(null);

	const [width, widthRef, setWidth] = useRefState(0);
	const [height, heightRef, setHeight] = useRefState(0);

	const { verticalScale,
		derandomize, derandomizeRef,
		hardRock, hardRockRef,
		easy, easyRef,
	} = useContext(SettingsContext);
	
	const [fruitSize, setFruitSize] = useState(0);

	const recalculateFruitSize = useCallback(() => {
		let CS = beatmap.difficulty.circleSize;
		if (hardRock) CS = Math.min(10, CS * 1.3);
		if (easy) CS = CS * 0.5;
		const baseSize = 97; // TODO: Verify this value
		const scale = CalculateScaleFromCircleSize(CS);
		const size = baseSize * scale / 512 * ref.current.offsetWidth;
		setFruitSize(size);
		console.log("Fruit size", size);
	}, [beatmap.difficulty.circleSize, hardRock, easy, verticalScale]);

	useEffect(() => {
		recalculateFruitSize();
	}, [beatmap, hardRock, easy, verticalScale]);
		

	const onResize = () => {
		setWidth(ref.current.offsetWidth);
		setHeight(ref.current.offsetHeight);
		recalculateFruitSize();
	}

	useLayoutEffect(() => {
		onResize();
	}, []);
	

	useEffect(() => {
		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(ref.current);
		return () => resizeObserver.disconnect();
	}, []);

	let approachRate = beatmap.difficulty.approachRate;
	if (hardRock) approachRate = Math.min(10, approachRate * 1.4);
	if (easy) approachRate = approachRate * 0.5;
	
	const ARPreempt = useMemo(() => calculatePreempt(approachRate), [approachRate]);
	const preempt = useMemo(() => ARPreempt * height / (width * (3 / verticalScale) / 4), [ARPreempt, height, width, verticalScale]); // TODO: add a slight value to preempt
	const preemptRef = useRef(preempt);
	preemptRef.current = preempt;

	const {playing, playerRef} = useContext(PlayStateContext);

	// TODO: use svg or canvas for better performance

	if (!beatmap.ctbObjects) beatmap.ctbObjects = parseHitObjects(beatmap);
	const objects = beatmap.ctbObjects;
	const objectRef = useRef(objects);
	objectRef.current = objects;
	const objectOnScreen = useRef({}); // Dictionary of the objects div that are currently on screen
	const L = useRef(0), R = useRef(0); // Left and Right pointers of the all objects array, for better performance [L, R)
	const lastTime = useRef(-1000000); // Last time of the song

	useEffect(() => {
		L.current = 0; R.current = 0; lastTime.current = -1000000;
		objectOnScreen.current = {};
		ref.current.innerHTML = "";
	}, [beatmap]);

	const getObjectX = (i) => {
		const obj = objectRef.current[i];
		const HardRockRef = false;
		let x = obj.x + (HardRockRef ? (obj?.xOffsetHR ?? 0) : (obj?.xOffset ?? 0));
		if (derandomizeRef.current) x = obj.x;
		return x / 512 * widthRef.current;
	}
	const getObjectY = (i) => {
		return (1 - (objectRef.current[i].time - playerRef.current.currentTime * 1000) / preempt) * heightRef.current;
	}

	const update = () => {
		const objects = objectRef.current;
		const currentTime = playerRef.current.currentTime * 1000;
		const width = widthRef.current;
		const height = heightRef.current;
		const preempt = preemptRef.current;
		if (currentTime == lastTime.current) { lastTime.current = currentTime; return; }
		//console.log(currentTime, lastTime.current);
		const startTime = currentTime - 200, endTime = currentTime + preempt + 200;
		
		if (Math.abs(currentTime - lastTime.current) > 20000) {
			//console.log("Jumped");
			L.current = binarySearch(objects, startTime);
			for (R.current = L.current; R.current < objects.length && objects[R.current].time <= endTime; R.current++) {
				const i = R.current;
				//console.log(objects[R.current]);
				//updateObject(i, objects[i].x / 512 * width, (1 - (objects[i].time - currentTime) / preempt) * height);
				updateObject(i, getObjectX(i), getObjectY(i));
			}
			removeObjects();
			//console.log("range", L.current, R.current);
			lastTime.current = currentTime;
			return;
		}
		lastTime.current = currentTime;
		while (L.current < objects.length && objects[L.current].time < startTime) {
			removeObject(L.current);
			L.current++;
		}
		while (L.current - 1 >= 0 && objects[L.current - 1].time >= startTime) {
			L.current--;
		}
		const oldR = R.current;
		for (R.current = L.current; R.current < objects.length && objects[R.current].time <= endTime; R.current++) {
			const i = R.current;
			//updateObject(i, objects[i].x / 512 * width, (1 - (objects[i].time - currentTime) / preempt) * height);
			updateObject(i, getObjectX(i), getObjectY(i));
		}
		for (let i = R.current; i < oldR; i++) {
			removeObject(i);
		}
	}

	const removeObjects = () => {
		for (let i = 0; i < ref.current.children.length; i++) {
			const obj = ref.current.children[i];
			const index = obj.index;
			//console.log(index, L.current, R.current);
			if (index < L.current || index >= R.current) {
				ref.current.removeChild(obj);
				objectOnScreen.current[index] = null;
				i--;
			}
		}
	}
	const removeObject = (index) => {
		if (!objectOnScreen.current[index]) return;
		ref.current.removeChild(objectOnScreen.current[index]);
		objectOnScreen.current[index] = null;
	}
	const updateObject = (index, x, y, show = true) => {
		//console.log("update", index, x, y);
		if (!show) return removeObject(index);
		if (objectOnScreen.current[index]) {
			objectOnScreen.current[index].style.transform = `translate(${x}px, ${y}px)`;
		} else {
			const div = Object(index, objectRef.current[index].type, objectRef.current[index].hyperDashTarget);
			div.style.transform = `translate(${x}px, ${y}px)`;
			objectOnScreen.current[index] = div;
			ref.current.appendChild(div);
		}
		return;
	}
	const refreshOnScreenObjects = () => {
		for (let i = L.current; i < R.current; i++) {
			updateObject(i, getObjectX(i), getObjectY(i));
		}
	}

	useEffect(() => {
		refreshOnScreenObjects();
	}, [derandomize, verticalScale, hardRock, easy]);

	const animationRef = useRef();
	useEffect(() => {
		if (!beatmap || !preempt || !width || !height) return;
		console.log("Start animation");
		const aniUpdate = () => {
			update();
			animationRef.current = requestAnimationFrame(aniUpdate);
		}
		animationRef.current = requestAnimationFrame(aniUpdate);
		return () => cancelAnimationFrame(animationRef.current);
	}, [width, height, verticalScale, preempt, beatmap, derandomize, hardRock, easy]);



	return (
		<div
			className="objects-canvas"
			style={{"--fruit-size": `${fruitSize}px`}}
			ref={ref}
		>
		</div>
	)
}

const updatePosition = (div) => (x, y) => {
	div.style.transform = `translate(${x}px, ${y}px)`;
}

const Object = (index, type = "fruit", hyper = false) => {
	const div = document.createElement("div");
	div.classList.add("object");
	div.classList.add(`object-${type}`);
	div.index = index;
	div.setAttribute("index", index);
	if (hyper) div.classList.add("hyper");
	return div;
}

const binarySearch = (arr, t) => { // Find the first index of the object which time >= t
	let l = 0, r = arr.length - 1;
	while (l < r) {
		let m = Math.floor((l + r) / 2);
		if (arr[m].time < t) l = m + 1;
		else r = m;
	}
	if (arr[l].time < t) return l + 1;
	return l;
}
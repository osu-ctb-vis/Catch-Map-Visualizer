import { useEffect, useRef, useLayoutEffect, useState, useContext, useMemo, useCallback } from "react";
import { SettingsContext } from "../../contexts/SettingsContext";
import "./AutoCatcher.scss";
import { calculatePreempt } from "../../utils/ApproachRate";
import { parseHitObjects } from "../../parser/HitobjectsParser";
import { PlayStateContext } from "../../contexts/PlayStateContext";
import { CalculateScaleFromCircleSize, CalculateCatchWidthByCircleSize } from "../../utils/CalculateCSScale";
import useRefState from "../../hooks/useRefState";

import { calculateAutoPath } from "../../parser/AutoPathCalculator";

export function AutoCatcher({ beatmap }) {
	const ref = useRef(null);

	const [width, widthRef, setWidth] = useRefState(0);

	const {
		derandomize,
		hardRock,
		easy,
	} = useContext(SettingsContext);

	/*const [fruitSize, setFruitSize] = useState(0);

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
	}, [beatmap, hardRock, easy, verticalScale]);*/
		

	const onResize = () => {
		setWidth(ref.current.parentElement.offsetWidth);
		//recalculateFruitSize();
	}

	useLayoutEffect(() => {
		onResize();
	}, []);
	

	useEffect(() => {
		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(ref.current);
		return () => resizeObserver.disconnect();
	}, []);

	useLayoutEffect(() => {
		const catcherWidth = CalculateCatchWidthByCircleSize(beatmap.difficulty.circleSize); // TODO: HR, EZ
		console.log("Catcher width", catcherWidth);
		ref.current.style.width = `${catcherWidth / 512 * width}px`;
		ref.current.style.left = `-${catcherWidth / 512 * width / 2}px`;
	}, [beatmap.difficulty.circleSize, width, hardRock, easy]);

	
	const {playing, playerRef} = useContext(PlayStateContext);

	// TODO: use svg or canvas for better performance
	const lastTime = useRef(-1000000); // Last time of the song
	const index = useRef(0); // Index of the current path segment

	useEffect(() => {
		lastTime.current = -1000000;
	}, [beatmap]);

	const catcherPath = useMemo(() => {
		if (!beatmap) return [];
		return calculateAutoPath(parseHitObjects(beatmap), beatmap, hardRock, easy, derandomize); // TODO: Extract the parsing to upper level
	}, [beatmap]);

	const update = () => {
		const currentTime = playerRef.current.currentTime * 1000;
		if (currentTime === lastTime.current) return;
		let newIndex = index.current;
		if (Math.abs(currentTime - lastTime.current) > 20000) {
			newIndex = binarySearch(catcherPath, currentTime);	
		}
		while (newIndex + 1 < catcherPath.length && catcherPath[newIndex + 1].fromTime <= currentTime) {
			newIndex++;
		}
		while (newIndex - 1 > 0 && catcherPath[newIndex].fromTime > currentTime) {
			newIndex--;
		}
		const width = widthRef.current;
		const seg = catcherPath[newIndex];
		//console.log(seg, currentTime);
		const percent = Math.min((currentTime - seg.fromTime) / (seg.toTime - seg.fromTime), 1);
		//console.log(percent);

		const x = seg.fromX + (seg.toX - seg.fromX) * percent;


		index.current = newIndex;
		
		ref.current.style.transform = `translate(${x / 512 * width}px, 0)`;
		lastTime.current = currentTime;
	}


	const animationRef = useRef();
	useEffect(() => {
		if (!beatmap) return;
		const aniUpdate = () => {
			update();
			animationRef.current = requestAnimationFrame(aniUpdate);
		}
		animationRef.current = requestAnimationFrame(aniUpdate);
		return () => cancelAnimationFrame(animationRef.current);
	}, [width, beatmap, derandomize, hardRock, easy]);



	return (
		<div
			className="auto-catcher"
			ref={ref}
		>
		</div>
	)
}


const binarySearch = (arr, t) => { // Find the last index of the seg that has fromTime <= t
	let l = 0, r = arr.length - 1;
	while (l < r) {
		let m = Math.floor((l + r + 1) / 2);
		if (arr[m].fromTime <= t) l = m;
		else r = m - 1;
	}
	return l;
}
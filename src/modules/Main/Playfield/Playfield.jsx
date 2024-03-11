import { useEffect, useRef, useLayoutEffect, useState, useContext, useMemo } from "react";
import useCachedMemo from "../../../hooks/useCachedMemo";
import { SettingsContext } from "../../../contexts/SettingsContext";
import { AccountContext } from "../../../contexts/AccountContext";
import { parseHitObjects } from "../../../parser/HitobjectsParser";
import { calculateAutoPath } from "../../../parser/AutoPathCalculator";
import { BananaPathCalculatingOverlay } from "./BananaPathCalculatingOverlay";
import "./Playfield.scss";
import { Grids } from './Grids';
import { ActualPlayfieldBorder } from './ActualPlayfieldBorder';
import { ObjectsCanvas } from './ObjectsCanvas';
import { AutoCatcher } from './AutoCatcher';

export function Playfield({ beatmap }) {
	const ref = useRef(null);

	const [height, setHeight] = useState(0);

	const onResize = () => {
		setHeight(ref.current.offsetHeight);
	}

	useLayoutEffect(() => {
		onResize();
	}, []);

	useEffect(() => {
		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(ref.current);
		return () => resizeObserver.disconnect();
	}, []);

	const verticalScale = useContext(SettingsContext).verticalScale;

	const maxWidth = height * 4 / (3 / verticalScale);


	const {
		derandomize,
		hardRock,
		easy,
	} = useContext(SettingsContext);

	if (!beatmap.ctbObjects) beatmap.ctbObjects = parseHitObjects(beatmap);

	/*const catcherPath = useCachedMemo(() => {
		//if (!beatmap) return [];
		return calculateAutoPath(beatmap.ctbObjects, beatmap, hardRock, easy, derandomize);
	}, [hardRock, easy, derandomize]);*/
	
	const { userInfo } = useContext(AccountContext);

	const hasBanana = beatmap.ctbObjects.some(obj => obj.type === "banana");

	const [catcherPath, setPath] = useState(null);
	const [bestCatcherPath, setBestPath] = useState(null);
	const [calculatingPath, setCalculatingPath] = useState(hasBanana && userInfo?.eligible);

	const [pathCalcProgress, setPathCalcProgress] = useState(0);


	const calcPath = async () => {
		const normalPath = (await calculateAutoPath(
			beatmap.ctbObjects, beatmap.difficulty.circleSize, hardRock, easy, derandomize
		)).path;
		setPath(normalPath);
	}

	useEffect(() => {
		if (hasBanana) {
			setCalculatingPath(true);
			setPathCalcProgress(0);
		}
		calcPath();
		if (!hasBanana) {
			setCalculatingPath(false);
			return;
		}
		if (!userInfo?.eligible) {
			setCalculatingPath(false);
			return;
		}
		const worker = new Worker(new URL('./../../../parser/AutoPathCalculatorWorker.js', import.meta.url), { type: 'module' });
		worker.postMessage({
			params: [beatmap.ctbObjects, beatmap.difficulty.circleSize, hardRock, easy, derandomize],
		});
		worker.onmessage = (event) => {
			if (event.data.error) {
				setCalculatingPath(false);
				console.error(event.data.error);
				return;
			}
			if (event.data.progress) {
				setPathCalcProgress(event.data.progress.current / event.data.progress.total);
				return;
			}
			const { path, missedBananas } = event.data.result;
			for (const obj of beatmap.ctbObjects) delete obj.bananaMissed;
			for (const index of missedBananas) beatmap.ctbObjects[index].bananaMissed = true;
			setBestPath(path);
			setCalculatingPath(false);
		}
		return () => worker.terminate();
		// TODO: Cache calculated paths
	}, [beatmap, hardRock, easy, derandomize, userInfo?.eligible]);


	return (
		<div
			className="Playfield"
			ref={ref}
			style={{
				...((height === 0) ? {} : { maxWidth: maxWidth + "px" })
			}}
		>
			<BananaPathCalculatingOverlay progress={pathCalcProgress} calculating={calculatingPath} />
			<AutoCatcher beatmap={beatmap} catcherPath={bestCatcherPath || catcherPath} />
			<ObjectsCanvas beatmap={beatmap} ctbObjects={beatmap.ctbObjects} catcherPath={bestCatcherPath || catcherPath} />
			<Grids />
			<ActualPlayfieldBorder />
		</div>
	)
}
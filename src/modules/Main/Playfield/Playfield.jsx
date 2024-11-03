import { useEffect, useRef, useLayoutEffect, useState, useContext, useMemo } from "react";
import useCachedMemo from "../../../hooks/useCachedMemo";
import { SettingsContext } from "../../../contexts/SettingsContext";
import { AccountContext } from "../../../contexts/AccountContext";
import { parseHitObjects } from "../../../parser/HitobjectsParser";
import { calculateAutoPath } from "../../../parser/AutoPathCalculator";
import { BananaPathCalculatingOverlay } from "./BananaPathCalculatingOverlay";
import { StatsOverlay } from "./StatsOverlay";
import "./Playfield.scss";
import { Grids } from './Grids';
import { ActualPlayfieldBorder } from './ActualPlayfieldBorder';
import { ObjectsCanvas } from './ObjectsCanvas';
import { LegacyObjectsCanvas } from './LegacyObjectsCanvas';
import { AutoCatcher } from './AutoCatcher';

const inDevelopmentBuild = import.meta.env.DEV;

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

	const { verticalScale } = useContext(SettingsContext);

	const aspectRatio = `4 / ${3 / verticalScale}`;
	
	const maxWidth = height * 4 / (3 * verticalScale);


	const {
		derandomize,
		hardRock,
		easy,
		gameSpeed,
		maxSpinLeniency,
		useLegacyDOMRenderer,
	} = useContext(SettingsContext);

	const ctbObjectsKey = JSON.stringify([
		beatmap.difficulty.circleSize,
		beatmap.difficulty.approachRate,
		hardRock,
		easy,
		gameSpeed,
		maxSpinLeniency,
	]);
	if (!beatmap.ctbObjects) beatmap.ctbObjects = {};
	if (!beatmap.ctbObjects[ctbObjectsKey]) beatmap.ctbObjects[ctbObjectsKey] = parseHitObjects(beatmap, hardRock, easy, gameSpeed);
	const ctbObjects = beatmap.ctbObjects[ctbObjectsKey];

	/*const catcherPath = useCachedMemo(() => {
		//if (!beatmap) return [];
		return calculateAutoPath(beatmap.ctbObjects, beatmap, hardRock, easy, derandomize);
	}, [hardRock, easy, derandomize]);*/
	
	const { userInfo } = useContext(AccountContext);

	const hasBanana = ctbObjects.some(obj => obj.type === "banana");

	const [catcherPath, setPath] = useState(null);
	const [bestCatcherPath, setBestPath] = useState(null);
	const [bananaSegmentPaths, setBananaSegmentPaths] = useState(null);
	const [calculatingPath, setCalculatingPath] = useState(hasBanana && userInfo?.eligible);

	const [pathCalcProgress, setPathCalcProgress] = useState(0);


	const calcPath = async () => {
		const normalPath = (await calculateAutoPath(
			ctbObjects,
			beatmap.difficulty.circleSize,
			beatmap.difficulty.approachRate,
			hardRock,
			easy,
			derandomize,
			gameSpeed,
			maxSpinLeniency
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
		if (!userInfo?.eligible && !inDevelopmentBuild) {
			setCalculatingPath(false);
			return;
		}
		const bananaPathKey = JSON.stringify([beatmap.difficulty.circleSize, beatmap.difficulty.approachRate, hardRock, easy, derandomize, gameSpeed, maxSpinLeniency]);
		const cachedPath = beatmap.cachedBananaPaths?.[bananaPathKey];
		const cachedbananaSegmentPaths = beatmap.cachedBananaSegmentPaths?.[bananaPathKey];
		if (cachedPath) {
			setBestPath(cachedPath);
			setCalculatingPath(false);
			return;
		}
		const worker = new Worker(new URL('./../../../parser/AutoPathCalculatorWorker.js', import.meta.url), { type: 'module' });
		worker.postMessage({
			params: [ctbObjects, beatmap.difficulty.circleSize, beatmap.difficulty.approachRate, hardRock, easy, derandomize, gameSpeed, maxSpinLeniency],
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
			const { path, missedBananas, bananaSegmentPaths } = event.data.result;
			for (const obj of ctbObjects) delete obj.bananaMissed;
			for (const index of missedBananas) ctbObjects[index].bananaMissed = true;
			setBestPath(path);
			setBananaSegmentPaths(bananaSegmentPaths);
			setCalculatingPath(false);
			
			beatmap.cachedBananaPaths = beatmap.cachedBananaPaths || {};
			beatmap.cachedBananaPaths[bananaPathKey] = path;
			beatmap.cachedBananaSegmentPaths = beatmap.cachedBananaSegmentPaths || {};
			beatmap.cachedBananaSegmentPaths[bananaPathKey] = bananaSegmentPaths;
		}
		return () => worker.terminate();
	}, [beatmap, hardRock, easy, derandomize, gameSpeed, maxSpinLeniency, userInfo?.eligible]);


	return (
		<div
			className="Playfield"
			ref={ref}
			style={{
				...((height === 0) ? {} : { maxWidth: maxWidth + "px" })
			}}
		>
			<Grids />
			<ActualPlayfieldBorder />
			{
				useLegacyDOMRenderer ? 
				<LegacyObjectsCanvas beatmap={beatmap} ctbObjects={ctbObjects} catcherPath={bestCatcherPath || catcherPath} /> :
				<ObjectsCanvas beatmap={beatmap} ctbObjects={ctbObjects} catcherPath={bestCatcherPath || catcherPath} bananaSegmentPaths={bananaSegmentPaths} />
			}
			<AutoCatcher beatmap={beatmap} catcherPath={bestCatcherPath || catcherPath} />
			<BananaPathCalculatingOverlay progress={pathCalcProgress} calculating={calculatingPath} />
			<StatsOverlay beatmap={beatmap} ctbObjects={ctbObjects} progress={pathCalcProgress} calculating={calculatingPath} />
		</div>
	)
}
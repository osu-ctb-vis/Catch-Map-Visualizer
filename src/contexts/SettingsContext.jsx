import { createContext, useState } from "react";
import useSetting from "../hooks/useSetting";

export const SettingsContext = createContext(null);

export const SettingsProvider = ({children}) => {
	const [verticalScale, verticalScaleRef, setVerticalScale] = useSetting("verticalScale", 1);
	const [maxSpinLeniency, maxSpinLeniencyRef, setMaxSpinLeniency] = useSetting("maxSpinLeniency", 0.8, true);

	const [showGrid, showGridRef , setShowGrid] = useSetting("showGrid", true, true);
	const [derandomize, derandomizeRef, setDerandomize] = useSetting("derandomize", false);

	const [hardRock, hardRockRef, setHardRock] = useSetting("hardRock", false);
	const [easy, easyRef, setEasy] = useSetting("easy", false);

	const [gameSpeed, gameSpeedRef, setGameSpeed] = useSetting("gameSpeed", 1, false);

	const [showBananaPathShade, showBananaPathShadeRef, setShowBananaPathShade] = useSetting("showBananaPathShade", true, true);

	const [showFPS, showFPSRef, setShowFPS] = useSetting("showFPS", false, true);

	const [backgroundDim, backgroundDimRef, setBackgroundDim] = useSetting("backgroundDim", 0.8, true);

	const [volume, volumeRef, setVolume] = useSetting("volume", 0.1, true);

	const [skinnedCatcher, skinnedCatcherRef , setSkinnedCatcher] = useSetting("skinnedCatcher", false, true);

	const [beatmapMirror, beatmapMirrorRef , setBeatmapMirror] = useSetting("beatmapMirror", 'sayobot', true);

	const [useLegacyDOMRenderer, useLegacyDOMRendererRef, setUseLegacyDOMRenderer] = useSetting("useLegacyDOMrenderer", false, true);

	return (
		<SettingsContext.Provider value={{
			verticalScale, setVerticalScale, verticalScaleRef,
			maxSpinLeniency, setMaxSpinLeniency, maxSpinLeniencyRef,
			showGrid, setShowGrid, showGridRef,
			derandomize, setDerandomize, derandomizeRef,
			hardRock, setHardRock, hardRockRef,
			easy, setEasy, easyRef,
			gameSpeed, setGameSpeed, gameSpeedRef,
			showBananaPathShade, setShowBananaPathShade, showBananaPathShadeRef,
			showFPS, setShowFPS, showFPSRef,
			backgroundDim, setBackgroundDim, backgroundDimRef,
			volume, setVolume, volumeRef,
			skinnedCatcher, setSkinnedCatcher, skinnedCatcherRef,
			beatmapMirror, beatmapMirrorRef , setBeatmapMirror,
			useLegacyDOMRenderer, setUseLegacyDOMRenderer, useLegacyDOMRendererRef,
		}}>
			{children}
		</SettingsContext.Provider>
	)
}
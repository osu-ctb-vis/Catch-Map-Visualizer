import { createContext, useState } from "react";
import useSetting from "../hooks/useSetting";

export const SettingsContext = createContext(null);

export const SettingsProvider = ({children}) => {
	const [verticalScale, verticalScaleRef, setVerticalScale] = useSetting("verticalScale", 1);
	const [showGrid,showGridRef , setShowGrid] = useSetting("showGrid", true, true);
	const [derandomize, derandomizeRef, setDerandomize] = useSetting("derandomize", false);

	const [hardRock, hardRockRef, setHardRock] = useSetting("hardRock", false);
	const [easy, easyRef, setEasy] = useSetting("easy", false);

	const [gameSpeed, gameSpeedRef, setGameSpeed] = useSetting("gameSpeed", 1, false);
	
	const [showFPS, showFPSRef, setShowFPS] = useSetting("showFPS", false, true);

	const [backgroundDim, backgroundDimRef, setBackgroundDim] = useSetting("backgroundDim", 0.8, true);

	return (
		<SettingsContext.Provider value={{
			verticalScale, setVerticalScale, verticalScaleRef,
			showGrid, setShowGrid, showGridRef,
			derandomize, setDerandomize, derandomizeRef,
			hardRock, setHardRock, hardRockRef,
			easy, setEasy, easyRef,
			gameSpeed, setGameSpeed, gameSpeedRef,
			showFPS, setShowFPS, showFPSRef,
			backgroundDim, setBackgroundDim, backgroundDimRef,
		}}>
			{children}
		</SettingsContext.Provider>
	)
}
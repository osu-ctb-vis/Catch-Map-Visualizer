import { createContext, useState } from "react";
import useSetting from "../hooks/useSetting";

export const SettingsContext = createContext(null);

export const SettingsProvider = ({children}) => {
	const [verticalScale, verticalScaleRef, setVerticalScale] = useSetting("verticalScale", 1);
	const [showGrid,showGridRef , setShowGrid] = useSetting("showGrid", true, true);
	const [derandomize, derandomizeRef, setDerandomize] = useSetting("derandomize", false);

	const [hardRock, hardRockRef, setHardRock] = useSetting("hardRock", false);
	const [easy, easyRef, setEasy] = useSetting("easy", false);

	window.setVerticalScale = setVerticalScale;

	return (
		<SettingsContext.Provider value={{
			verticalScale, setVerticalScale, verticalScaleRef,
			showGrid, setShowGrid, showGridRef,
			derandomize, setDerandomize, derandomizeRef,
			hardRock, setHardRock, hardRockRef,
			easy, setEasy, easyRef,
		}}>
			{children}
		</SettingsContext.Provider>
	)
}
import { createContext, useState, useEffect, useContext } from "react";
import { MapPackContext } from "./MapPackContext";

export const BeatmapsContext = createContext(null);

export const BeatmapsProvider = ({children}) => {
	const mapPack = useContext(MapPackContext).mapPack;

	const [beatmaps, setBeatmaps] = useState(null);

	useEffect(() => {
		if (!mapPack) return;
		// TODO: Change the way to choose the default beatmap
		const defaultBeatmap = [
			...mapPack.beatmaps.filter((d) => d.originalMode == 0),
			...mapPack.beatmaps.filter((d) => d.originalMode == 2),
			...mapPack.beatmaps.filter((d) => d.preferredDifficulty)
		].pop(); // Choose the hardest ctb difficulty, or the hardest difficulty if there are no ctb beatmap 
		if (!defaultBeatmap) setBeatmaps([]);
		else setBeatmaps([defaultBeatmap]);
	}, [mapPack]);

	// For debugging
	useEffect(() => {
		window.beatmaps = beatmaps;
	}, [beatmaps]);

	return (
		<BeatmapsContext.Provider value={{
			beatmaps,
			setBeatmaps,
		}}>
			{children}
		</BeatmapsContext.Provider>
	)
}
import { createContext, useState, useEffect, useContext } from "react";
import { MapPackContext } from "./MapPackContext";

export const BeatmapsContext = createContext(null);

export const BeatmapsProvider = ({children}) => {
	const mapPack = useContext(MapPackContext).mapPack;

	const [beatmaps, setBeatmaps] = useState(null);

	useEffect(() => {
		if (!mapPack) return;
		const defaultBeatmap = [
			...mapPack.beatmaps.filter((d) => d.originalMode == 0),
			...mapPack.beatmaps.filter((d) => d.originalMode == 2)
		].pop(); // Choose the hardest ctb difficulty, or the hardest difficulty if there are no ctb beatmap 
		setBeatmaps([defaultBeatmap]);
	}, [mapPack]);

	return (
		<BeatmapsContext.Provider value={{
			beatmaps,
			setBeatmaps,
		}}>
			{children}
		</BeatmapsContext.Provider>
	)
}
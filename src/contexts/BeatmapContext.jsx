import { createContext, useState, useEffect, useContext } from "react";
import { MapPackContext } from "./MapPackContext";

export const BeatmapContext = createContext(null);

export const BeatmapProvider = ({children}) => {
	const mapPack = useContext(MapPackContext).mapPack;

	const [beatmap, setBeatmap] = useState(null);

	useEffect(() => {
		if (!mapPack) return;
		const defaultBeatmap = [
			...mapPack.beatmaps.filter((d) => d.originalMode == 0),
			...mapPack.beatmaps.filter((d) => d.originalMode == 2)
		].pop(); // Choose the hardest ctb difficulty, or the hardest difficulty if there are no ctb beatmap 
		setBeatmap(defaultBeatmap);
	}, [mapPack]);

	return (
		<BeatmapContext.Provider value={{
			beatmap,
			setBeatmap,
		}}>
			{children}
		</BeatmapContext.Provider>
	)
}
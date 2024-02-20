import { createContext, useState } from "react";
import { parseFile } from "../parser/MapPackParser";

export const MapPackContext = createContext(null);

export const MapPackProvider = ({children}) => {
	const [mapPack, setMapPack] = useState(null);

	const loadOszFile = async (file) => {
		const parsed = await parseFile(file);
		if (!parsed) return;
		setMapPack(parsed);
		console.log('loaded .osz file', parsed);

		if (!parsed.beatmaps.length) return;
	}

	return (
		<MapPackContext.Provider value={{
			mapPack,
			loadOszFile
		}}>
			{children}
		</MapPackContext.Provider>
	)
}
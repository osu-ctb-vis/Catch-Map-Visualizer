import { createContext, useState } from "react";
import { parseFile } from "../parser/parser";

export const MapPackContext = createContext(null);

export const MapPackProvider = ({children}) => {
	const [mapPack, setMapPack] = useState(null);

	const loadOszFile = async (file) => {
		const parsed = await parseFile(file);
		if (!parsed) return;
		setMapPack(parsed);
		console.log('loaded .osz file', parsed);

		if (!parsed.difficulties.length) return;

		const defaultDifficulty = [parsed.difficulties.at(-1), ...parsed.difficulties.filter((d) => d.originalMode == 2)].pop(); // Choose the hardest ctb difficulty, or the hardest difficulty if there are no ctb difficulties 

		// TODO: load default difficulty
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
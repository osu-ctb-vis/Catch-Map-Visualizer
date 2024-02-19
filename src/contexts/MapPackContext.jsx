import { createContext, useState } from "react";

export const MapPackContext = createContext(null);

export const MapPackProvider = ({children}) => {
	const osuFileName = useState(null);

	const loadOsuFile = (file) => {
		console.log('loading .osu file', file);
		
	}

	return (
		<MapPackContext.Provider value={{
			osuFileName,
			loadOsuFile
		}}>
			{children}
		</MapPackContext.Provider>
	)
}
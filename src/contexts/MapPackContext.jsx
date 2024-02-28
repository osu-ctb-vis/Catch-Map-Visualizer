import { createContext, useState } from "react";

export const MapPackContext = createContext(null);

export const MapPackProvider = ({children}) => {
	const [mapPack, setMapPack] = useState(null);

	const loadMapPack = async (mapPack) => {
		console.log('loaded mappack', mapPack);
		
		setMapPack(mapPack);
	}

	return (
		<MapPackContext.Provider value={{
			mapPack,
			loadMapPack
		}}>
			{children}
		</MapPackContext.Provider>
	)
}
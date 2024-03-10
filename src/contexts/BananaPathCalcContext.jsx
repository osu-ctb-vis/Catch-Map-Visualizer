import { createContext, useState } from "react";

export const BananaPathCalcContext = createContext(null);

export const BananaPathCalcProvider = ({children}) => {

	// TODO
	return (
		<BananaPathCalcContext.Provider value={{
		}}>
			{children}
		</BananaPathCalcContext.Provider>
	)
}
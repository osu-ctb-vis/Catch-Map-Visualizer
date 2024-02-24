import { createContext, useState } from "react";

export const SettingsContext = createContext(null);

export const SettingsProvider = ({children}) => {
	const [verticalScale, setVerticalScale] = useState(1);

	window.setVerticalScale = setVerticalScale;

	return (
		<SettingsContext.Provider value={{
			verticalScale, setVerticalScale
		}}>
			{children}
		</SettingsContext.Provider>
	)
}
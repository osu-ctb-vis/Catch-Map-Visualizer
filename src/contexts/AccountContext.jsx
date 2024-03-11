import { createContext, useState } from "react";

export const AccountContext = createContext(null);

export const AccountProvider = ({children}) => {
	const [loggedIn, setLoggedIn] = useState(!!window?.userInfo?.id);
	const [userInfo, setUserInfo] = useState(window?.userInfo || {});


	return (
		<AccountContext.Provider value={{
			loggedIn, setLoggedIn,
			userInfo, setUserInfo,
		}}>
			{children}
		</AccountContext.Provider>
	)
}
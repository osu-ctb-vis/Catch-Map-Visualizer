import { createContext, useState } from "react";

export const SkinContext = createContext(null);

export const SKinProvider = ({children}) => {
	const [skin, setSkin] = useState(null);

	const loadSkin = async (skin) => {
		console.log("loaded skin", skin);

		setSkin(skin);
		console.log(skin);
	}

	return (
		<SkinContext.Provider value={{
			skin,
			loadSkin
		}}>
			{ skin && <SkinCSSLayer skin={skin} /> }
			{children}
		</SkinContext.Provider>
	)
}

function SkinCSSLayer(skin) {
	skin = skin.skin;
	let styleString = "";
	const addSkinElement = (selector, image) => {
		styleString += `
			.objects-canvas ${selector} {
				background-image: url(${image});
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				background-color: transparent;
			}
		`;
	};
	const lookupElement = (name, selector) => {
		if (skin[name]) {
			addSkinElement(selector, skin[name]);
		}
	};
	lookupElement('fruit-apple', '.object-fruit');
	lookupElement('fruit-orange', '.object-drop');
	lookupElement('fruit-drop', '.object-droplet');
	lookupElement('fruit-bananas', '.object-banana');
	return (
		<style>
			{styleString}
		</style>
	)
}
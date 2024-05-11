import { createContext, useLayoutEffect, useState } from "react";
import { parsePresetSkin } from "../parser/SkinParser";

export const SkinContext = createContext(null);

export const SKinProvider = ({children}) => {
	const [skin, setSkin] = useState(null);

	const loadSkin = async (skin) => {
		console.log("loaded skin", skin);

		setSkin(skin);
		console.log(skin);
	}

	useLayoutEffect(() => {
		// Load default skin
		(async () => {
			console.log("loading default skin");
			loadSkin(await parsePresetSkin("default"));
		})();
	}, []);


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
	lookupElement('fruit-apple', '.object-fruit.object-visual-pineapple');
	lookupElement('fruit-grapes', '.object-fruit.object-visual-grape');
	lookupElement('fruit-pear', '.object-fruit.object-visual-pear');
	lookupElement('fruit-orange', '.object-fruit.object-visual-raspberry');
	lookupElement('fruit-orange', '.object-drop');
	lookupElement('fruit-drop', '.object-droplet');
	lookupElement('fruit-bananas', '.object-banana');
	return (
		<style>
			{styleString}
		</style>
	)
}
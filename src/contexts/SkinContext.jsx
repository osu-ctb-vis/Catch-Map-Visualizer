import { createContext, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { parsePresetSkin } from "../parser/SkinParser";
import { Assets } from "pixi.js";
import transparentSVG from "../assets/transparent.svg?base64";
import { saveLocalSkin, getAllLocalSkins, getLocalSkin, deleteLocalSkin } from '../utils/LocalSkinStorage';

export const SkinContext = createContext(null);

let transparentTexture = null;
const loadTransparentTexture = async () => {
	if (transparentTexture) return transparentTexture;
	transparentTexture = await Assets.load("data:image/svg+xml;base64," + transparentSVG);
	return transparentTexture;
}

export const SKinProvider = ({children}) => {
	const [skinName, setSkinName] = useState(null); // TOOD: Delete this, use skin.name instead
	const [skinID, setSkinID] = useState(null); // Skin ID is either ^default-[a-z]$ or ^custom- + a slugified name
	const [skin, setSkin] = useState(null);
	const [skinAssets, setSkinAssets] = useState(null);

	const [localSkins, setLocalSkins] = useState([]);


	const loadSkin = async (skin, skinID, skinName) => {
		console.log("all local skins", await getAllLocalSkins());
		console.log("loaded skin", skinName, skin);

		setSkin(skin);
		console.log(skin);

		setSkinID(skinID);
		setSkinName(skinName);

		// TODO: Unload previous skin assets

		// Load skin as PIXI textures
		const keys = Object.keys(skin);
		const textures = {};
		await Promise.all([...keys.filter(key => typeof(skin[key]) == "string" && skin[key].startsWith("blob:")).map(key => new Promise(async (resolve, reject) => {
			// TODO: Dont use blob urls, use base64 strings everywhere
			const blobUrl = skin[key];
			const blob = await fetch(blobUrl).then(res => res.blob());
			const base64 = await (new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					resolve(e.target.result);
				}
				reader.onerror = (e) => {
					reject(e);
				}
				reader.readAsDataURL(blob);
			}));
			const texture = await Assets.load(base64);
			//console.log("loaded texture", key, texture);
			textures[key] = texture;
			resolve();
		})), new Promise(async (resolve, reject) => {
			const texture = await loadTransparentTexture();
			textures["transparent"] = texture;
			resolve();
		})]);
		setSkinAssets(textures);
		console.log("loaded skin assets", textures);
		
		// save perference
		localStorage.setItem("skinID", skinID);
	}

	const loadExternalSkin = async (skin) => {
		const skinID = "custom-" + skin.name.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').toLowerCase();
		await loadSkin(skin, skinID, skin.name);
		const localSkins = await getAllLocalSkins();
		if (localSkins.find(skin => skin.id == skinID)) {
			return;
		}
		await saveLocalSkin(skin, skinID);
		setLocalSkins([...localSkins, {id: skinID, skin}]);
	}

	const loadLocalSkin = async (id) => {
		const skin = await getLocalSkin(id);
		if (skin) {
			console.log("loading local skin", id, skin, typeof skin, Object.keys(skin));
			await loadSkin(skin, id, skin.name);
		}
	}

	const loadPresetSkin = useCallback(async (id) => {
		if (id == "default-classic") {
			loadSkin(await parsePresetSkin("classic"), "default-classic", "Classic");
		} else if (id == "default-simple") {
			loadSkin(await parsePresetSkin("simple"), "default-simple", "Simple");
		} else {
			console.error("unknown skin id for default skin", id);
		}
	}, []);

	const deleteSkin = async (id) => {
		loadPresetSkin("default-classic");
		await deleteLocalSkin(id);
		const localSkins = await getAllLocalSkins();
		setLocalSkins(localSkins);
	}

	useLayoutEffect(() => {
		// Load default skin
		(async () => {
			console.log("loading default skin");
			const preferedSkinID = localStorage.getItem("skinID") || "default-classic";
			if (preferedSkinID.startsWith("default-")) {
				loadPresetSkin(preferedSkinID);
			} else {
				loadLocalSkin(preferedSkinID);
			}
			//await loadPresetSkin("default-classic");
			//await loadPresetSkin("default-simple");
		})();
	}, []);

	useEffect(() => {
		(async () => {
			const localSkins = await getAllLocalSkins();
			setLocalSkins(localSkins);
		})();
	}, []);


	return (
		<SkinContext.Provider value={{
			skin,
			loadSkin,
			loadPresetSkin,
			loadExternalSkin,
			loadLocalSkin,
			skinAssets,
			skinName,
			skinID,
			localSkins,
			deleteSkin
		}}>
			{ skin && <SkinCSSLayer skin={skin} /> }
			{ children }
		</SkinContext.Provider>
	)
}

function SkinCSSLayer(skin) { // This is deprecated, for the old dom renderer
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
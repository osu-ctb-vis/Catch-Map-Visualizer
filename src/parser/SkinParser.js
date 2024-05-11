import { parseZipFromBuffer } from '../utils/parseZipFromBuffer';
import defaultSkin from "../assets/default-skin.zip?base64";
import simpleSkin from "../assets/simple-skin.zip?base64";
import { parseZip } from './ZipParser';

const skinFilenames = [
	"fruit-apple-overlay",
	"fruit-apple",
	"fruit-bananas-overlay",
	"fruit-bananas",
	"fruit-catcher-fail",
	"fruit-catcher-idle",
	"fruit-catcher-kiai",
	"fruit-drop",
	"fruit-grapes-overlay",
	"fruit-grapes",
	"fruit-orange-overlay",
	"fruit-orange",
	"fruit-pear-overlay",
	"fruit-pear"
]

const imgFileToBase64 = async (imgFile) => {
	const imgBuffer = await imgFile.async("blob").catch(() => null);
	if (imgBuffer) {
		return URL.createObjectURL(imgBuffer);
	}
	return null;
}


export async function parseSkinFromZipFile(zipFile) {
	console.log('parsing skin from zip file', zipFile);
	const skin = {};
	for (const filename of skinFilenames) {
		const normalSVG = zipFile[filename + ".svg"];
		const doubleSVG = zipFile[filename + "@2x.svg"];
		const normalPNG = zipFile[filename + ".png"];
		const doublePNG = zipFile[filename + "@2x.png"];
		const tryFiles = [normalSVG, doubleSVG, normalPNG, doublePNG];
		for (const file of tryFiles) {
			if (file) {
				const base64 = await imgFileToBase64(file);
				if (base64) {
					skin[filename] = base64;
					break;
				}
			}
		}
	}

	return skin;
}

export async function parsePresetSkin(name) {
	console.log('loading preset skin', name);
	const base64 = name === "default" ? defaultSkin : simpleSkin;
	const buffer = atob(base64);
	const zipFile = await parseZipFromBuffer(buffer);
	return await parseSkinFromZipFile(zipFile);
}
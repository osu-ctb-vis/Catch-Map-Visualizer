import { parseZipFromBuffer } from '../utils/parseZipFromBuffer';
import classicSkin from "../assets/classic-skin.zip?base64";
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
	"fruit-drop-overlay",
	"fruit-grapes-overlay",
	"fruit-grapes",
	"fruit-orange-overlay",
	"fruit-orange",
	"fruit-pear-overlay",
	"fruit-pear"
]

const imgFileToBlobUrl = async (imgFile, mimeType = "image/png") => {
	const imgBuffer = await imgFile.async("blob").catch(() => null);
	if (imgBuffer) {
		const blob = imgBuffer.slice(0, imgBuffer.size, mimeType);
		return URL.createObjectURL(blob);
	}
	return null;
}


export async function parseSkinFromZipFile(zipFile, name = null) {
	console.log('parsing skin from zip file', zipFile);
	const skin = {};
	for (const filename of skinFilenames) {
		const normalSVG = filename + ".svg";
		const doubleSVG = filename + "@2x.svg";
		const normalPNG = filename + ".png";
		const doublePNG = filename + "@2x.png";
		const mimetypes = {
			'svg': 'image/svg+xml',
			'png': 'image/png'
		}
		const tryFiles = [normalSVG, doubleSVG, normalPNG, doublePNG];
		for (const variant of tryFiles) {
			const file = zipFile[variant];
			if (file) {
				const blobUrl = await imgFileToBlobUrl(file, mimetypes[variant.split('.').pop()]);
				if (blobUrl) {
					skin[filename] = blobUrl;
					break;
				}
			}
		}
	}

	// Read info from skin.ini
	const skinIni = (await (async () => {
		try {
			return await zipFile["skin.ini"].async("text");
		} catch (e) {
			return "";
		}
	})()).split("\n").map(line => line.trim());


	// Combo colours
	let comboColours = [];

	for (let i = 1; i <= 8; i++) {
		const line = skinIni.find(line => line.startsWith(`Combo${i}:`));
		if (!line) break;
		const [r, g, b] = line.split(":")[1].split(",").map(x => parseInt(x));
		comboColours.push([r, g, b]);
	}
	console.log('combo colours', comboColours);
	if (!comboColours.length) {
		comboColours.push([255, 192, 0]);
		comboColours.push([0, 202, 0]);
		comboColours.push([18, 124, 255]);
		comboColours.push([242, 24, 57]);
	}
	console.log('combo colours', comboColours);
	comboColours = comboColours.map(([r, g, b]) => r * 256 * 256 + g * 256 + b);
	skin.comboColours = comboColours;

	// Skin name
	const nameLine = skinIni.find(line => line.startsWith("Name:"));
	if (nameLine) {
		name = nameLine.split(":")[1].trim();
	}
	if (!name) {
		name = "Custom skin " + Math.random().toString(36).substring(7);
	}
	skin.name = name.trim();

	return skin;
}

export async function parsePresetSkin(name) {
	console.log('loading preset skin', name);
	const base64 = (name === "classic" ? classicSkin : simpleSkin);
	const buffer = atob(base64);
	const zipFile = await parseZipFromBuffer(buffer);
	return await parseSkinFromZipFile(zipFile, name);
}

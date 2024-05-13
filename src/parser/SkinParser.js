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


export async function parseSkinFromZipFile(zipFile) {
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

	return skin;
}

export async function parsePresetSkin(name) {
	console.log('loading preset skin', name);
	const base64 = name === "default" ? defaultSkin : simpleSkin;
	const buffer = atob(base64);
	const zipFile = await parseZipFromBuffer(buffer);
	return await parseSkinFromZipFile(zipFile);
}
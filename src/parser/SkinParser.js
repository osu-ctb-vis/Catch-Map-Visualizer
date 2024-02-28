import { parseZipFromBuffer } from '../utils/parseZipFromBuffer';

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
		const normal = zipFile[filename + ".png"];
		const double = zipFile[filename + "@2x.png"];
		if (double) {
			skin[filename] = await imgFileToBase64(double);
		} else if (normal) {
			skin[filename] = await imgFileToBase64(normal);
		}
	}

	return skin;
}
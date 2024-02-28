import { useRef, useContext, useCallback } from 'react';
import { MapPackContext } from '../contexts/MapPackContext';
import { SkinContext } from '../contexts/SkinContext';
import { parseZip } from '../parser/ZipParser';
import { parseMapPackFromZipFile } from '../parser/MapPackParser';
import { parseSkinFromZipFile } from '../parser/SkinParser';

export default function useZipLoader() {
	const loadMapPack = useContext(MapPackContext).loadMapPack;
	const loadSkin = useContext(SkinContext).loadSkin;

	const loadZip = useCallback(async (file) => {
		const { zipFile, type } = await parseZip(file);
		if (type == "mapPack") {
			loadMapPack(await parseMapPackFromZipFile(zipFile));
		} else if (type == "skin") {
			loadSkin(await parseSkinFromZipFile(zipFile));
		} else {
			console.log("Unknown zip type");
		}
	});

	return loadZip;
}
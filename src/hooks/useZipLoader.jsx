import { useRef, useContext, useCallback } from 'react';
import { MapPackContext } from '../contexts/MapPackContext';
import { SkinContext } from '../contexts/SkinContext';
import { parseZip } from '../parser/ZipParser';
import { parseMapPackFromZipFile } from '../parser/MapPackParser';
import { parseSkinFromZipFile } from '../parser/SkinParser';

export default function useZipLoader() {
	const loadMapPack = useContext(MapPackContext).loadMapPack;
	const loadExternalSkin = useContext(SkinContext).loadExternalSkin;

	const loadZip = useCallback(async (file) => {
		const fileName = file.name;
		const { zipFile, type } = await parseZip(file);
		if (type == "mapPack") {
			loadMapPack(await parseMapPackFromZipFile(zipFile));
		} else if (type == "skin") {
			loadExternalSkin(await parseSkinFromZipFile(zipFile, fileName));
		} else {
			console.log("Unknown zip type");
		}
	});

	return loadZip;
}
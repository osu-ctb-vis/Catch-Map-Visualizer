import { useState, useContext, useEffect, useRef } from 'react';
import { MapPackContext } from '../../contexts/MapPackContext';
import { BeatmapsContext } from '../../contexts/BeatmapsContext';
import { SettingsContext } from '../../contexts/SettingsContext';
import clsx from 'clsx';
import './Background.scss';

export function Background() {
	const [img, setImg] = useState(null);
	const imgDefer = useRef(null);

	const beatmap = useContext(BeatmapsContext).beatmaps?.at(-1);
	const zipFile = useContext(MapPackContext).mapPack?.zipFile;
	
	const prevImgFileName = useRef(null);

	//const backgroundDim = useContext(SettingsContext).backgroundDim;

	const onBeatmapChange = async () => {
		if (!beatmap) {
			setImg(null);
			prevImgFileName.current = null;
			return;
		}
		const imgFileName = beatmap?.events.backgroundPath;
		if (imgFileName === prevImgFileName.current) return;
		prevImgFileName.current = imgFileName;
		console.log(imgFileName);
		console.log(zipFile);
		const imgFile = zipFile?.[imgFileName];
		if (!imgFile) {
			setImg(null);
			prevImgFileName.current = null;
			return;
		}
		const imgBuffer = await imgFile.async("blob").catch(() => null);
		if (!imgBuffer) {
			setImg(null);
			prevImgFileName.current = null;
			return;
		}
		console.log(imgBuffer);
		console.log(URL.createObjectURL(imgBuffer));
		setImg(URL.createObjectURL(imgBuffer));		
	};

	useEffect(() => {
		prevImgFileName.current = null;
	}, [zipFile]);

	useEffect(() => {
		onBeatmapChange();
	}, [beatmap]);


	if (img) imgDefer.current = img;

	// TODO: Don't use CSS background-image transition (will resize images), make our own component
	
	return (
		<>
			<div
				className={clsx("background", {"hidden": !img})}
				style={{
					backgroundImage: imgDefer.current ? `url(${imgDefer.current})` : 'none'
				}}
			/>
		</>
	)
}
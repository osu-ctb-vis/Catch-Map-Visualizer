import { useState, useContext, useEffect, useRef } from 'react';
import { MapPackContext } from '../../contexts/MapPackContext';
import { BeatmapContext } from '../../contexts/BeatmapContext';
import { Grids } from './Grids';
import clsx from 'clsx';
import './Background.scss';

export function Background() {
	const [img, setImg] = useState(null);
	const imgDefer = useRef(null);

	const beatmap = useContext(BeatmapContext).beatmap;
	const zipFile = useContext(MapPackContext).mapPack?.zipFile;
	
	const onBeatmapChange = async () => {
		const imgFileName = beatmap?.events.backgroundPath;
		console.log(imgFileName);
		console.log(zipFile);
		const imgFile = zipFile?.[imgFileName];
		if (!imgFile) {
			setImg(null);
			return;
		}
		const imgBuffer = await imgFile.async("blob").catch(() => null);
		if (!imgBuffer) {
			setImg(null);
			return;
		}
		console.log(imgBuffer);
		console.log(URL.createObjectURL(imgBuffer));
		setImg(URL.createObjectURL(imgBuffer));		
	};

	useEffect(() => {
		if (!beatmap) {
			setImg(null);
			return;
		}
		onBeatmapChange();
	}, [beatmap]);

	if (img) imgDefer.current = img;

	
	return (
		<>
			<div
				className={clsx("background", {"hidden": !img})}
				style={{
					backgroundImage: imgDefer.current ? `url(${imgDefer.current})` : 'none'
				}}
			/>
			{
				img && <Grids/>
			}
		</>
	)
}
import { useContext, useState, useEffect } from 'react';
import { BeatmapsContext } from '../../../contexts/BeatmapsContext';
import { Playfield } from './Playfield';
import "./PlayfieldsContainer.scss";
import clsx from "clsx";

export function PlayfieldsContainer() {
	const beatmaps = useContext(BeatmapsContext).beatmaps;

	const [hideStats, setHideStats] = useState(true);

	useEffect(() => {
		const onKeydown = (e) => {
			if (e.key === "Tab" && !e.repeat) {
				e.preventDefault();
				setHideStats((prev) => !prev);
			}
		}
		document.addEventListener("keydown", onKeydown);
		return () => document.removeEventListener("keydown", onKeydown);
	}, []);


	return (
		<div className={clsx("playfields-container", { "hide-stats-overlay": hideStats })}>
			{
				beatmaps?.map((beatmap, i) => (
					<Playfield
						key={beatmap.metadata.beatmapId + beatmap.metadata.version + beatmap.metadata.title}
						beatmap={beatmap}
					/>
				))
			}
		</div>
	)
}
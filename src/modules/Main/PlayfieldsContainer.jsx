import { useContext } from 'react';
import { BeatmapsContext } from '../../contexts/BeatmapsContext';
import { Playfield } from './Playfield';
import "./PlayfieldsContainer.scss";

export function PlayfieldsContainer() {
	const beatmaps = useContext(BeatmapsContext).beatmaps;
	return (
		<div className="Playfields-container">
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
import { useState, useContext, useEffect, useRef } from 'react';
import { MapPackContext } from '../../contexts/MapPackContext';
import { BeatmapsContext } from '../../contexts/BeatmapsContext';
import clsx from 'clsx';
import WelcomeSvg from '../../assets/welcome.svg';
import './Welcome.scss';

export function Welcome() {
	const { mapPack } = useContext(MapPackContext);
	const [loadExampleClicked, setLoadExampleClicked] = useState(false);

	const loadExampleBeatmap = () => {
		document.dispatchEvent(new CustomEvent("load-beatmap-from-url", { detail: "https://osu.ppy.sh/beatmapsets/1667811#fruits/3405617" }));
		setLoadExampleClicked(true);
	};

	if (!mapPack) return (
		<div className="welcome">
			<img src={WelcomeSvg} className="welcome-image" onDragStart={e => e.preventDefault()} />
			<div className="welcome-text">Catch Map Visualizer</div>
			<div className="welcome-instructions">Select or drag a beatmap to start<br/> or <div className={clsx("welcome-load-example", { disabled: loadExampleClicked })} onClick={loadExampleBeatmap}>load an example beatmap</div></div>
			<a href="https://github.com/osu-ctb-vis/Catch-Map-Visualizer" target="_blank" className="welcome-link">GitHub</a>
		</div>
	);

	return null;	
}
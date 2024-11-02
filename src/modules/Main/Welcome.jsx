import { useState, useContext, useEffect, useRef } from 'react';
import { MapPackContext } from '../../contexts/MapPackContext';
import { BeatmapsContext } from '../../contexts/BeatmapsContext';
import clsx from 'clsx';
import WelcomeSvg from '../../assets/welcome.svg';
import './Welcome.scss';

export function Welcome() {
	const { mapPack } = useContext(MapPackContext);

	if (!mapPack) return (
		<div className="welcome">
			<img src={WelcomeSvg} className="welcome-image" onDragStart={e => e.preventDefault()} />
			<div className="welcome-text">Catch Map Visualizer</div>
			<div className="welcome-instructions">Select or drag a beatmap to start</div>
			<a href="https://github.com/osu-ctb-vis/Catch-Map-Visualizer" target="_blank" className="welcome-link">GitHub</a>
		</div>
	);

	return null;	
}
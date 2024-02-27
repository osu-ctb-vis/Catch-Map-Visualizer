import { useState, useEffect, useRef, useContext } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import Stats from 'stats.js';
import "./FPSMonitor.scss";

export function FPSMonitor() {
	const ref = useRef();
	const [stats] = useState(() => new Stats());
	const animateRef = useRef();

	const enabled = useContext(SettingsContext).showFPS;

	useEffect(() => {
		if (enabled) {
			stats.showPanel(0);
			ref.current.appendChild(stats.dom);
			animateRef.current = () => {
				stats.update();
				requestAnimationFrame(animateRef.current);
			}
			animateRef.current();
		} else {
			animateRef.current && cancelAnimationFrame(animateRef.current);
			if (ref.current.contains(stats.dom)) ref.current.removeChild(stats.dom);
		}
	}, [enabled]);

	return (
		<div className="fps-monitor" ref={ref} />
	)
}
import { useContext, useState, useMemo, useEffect } from 'react'
import { BeatmapsContext } from '../../contexts/BeatmapsContext'
import { PlayStateContext } from '../../contexts/PlayStateContext'
import { MonospacedNumber } from '../Components/MonospacedNumber/MonospacedNumber'
import useRequestAnimationFrame from '../../hooks/useRequestAnimationFrame'
import './TimeIndicator.scss'

const parseTime = (time) => { // time in ms
	// TODO: Move to utils
	time = Math.round(time);
	return [
		Math.floor(time / 60000).toString().padStart(2, '0'),
		(Math.floor(time / 1000) % 60).toString().padStart(2, '0'),
		(time % 1000).toString().padStart(3, '0')
	];
}

export function TimeIndicator() {
	const beatmap = useContext(BeatmapsContext).beatmaps?.at(-1);

	const playerRef = useContext(PlayStateContext).playerRef;
	const getPreciseTime = useContext(PlayStateContext).getPreciseTime;

	const [currentTime, setCurrentTime] = useState(0);
	const totalTime = (beatmap?.totalLength) ?? playerRef?.current?.duration * 1000 ?? 0; // TODO: we need to make the length more accurate for VBR audios

	const [curMin, curSec, curMs] = parseTime(currentTime);
	const [totalMin, totalSec, totalMs] = parseTime(totalTime);

	const [start, stop] = useRequestAnimationFrame((time) => {
		setCurrentTime(getPreciseTime());
	});

	useEffect(() => {
		if (playerRef?.current) {
			start();
		}
		return () => stop();
	});


	return (
		<div className="time-indicator">
			<div className="upper">
				<div className="current-time">
					<span className="min"><MonospacedNumber>{curMin}</MonospacedNumber></span>
					<span className="colon">:</span>
					<span className="sec"><MonospacedNumber>{curSec}</MonospacedNumber></span>
					<span className="dot">.</span>
					<span className="ms"><MonospacedNumber>{curMs}</MonospacedNumber></span>
				</div>
			</div>
			<div className="lower">
				<div className="bpm">
					{Math.round(beatmap?.bpm || 0)}<span className="bpm-text">BPM</span>
				</div>
				<div className="total-time">
					<span className="min">{totalMin}</span>
					<span className="colon">:</span>
					<span className="sec">{totalSec}</span>
					<span className="dot">.</span>
					<span className="ms">{totalMs}</span>
				</div>
			</div>
		</div>
	)
}
import { useContext, useRef, useMemo, useEffect } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { BeatmapContext } from '../../contexts/BeatmapContext'
import './TimeIndicator.scss'

const parseTime = (time) => { // time in ms
	// TODO: Move to utils
	return [
		Math.floor(time / 60000).toString().padStart(2, '0'),
		(Math.floor(time / 1000) % 60).toString().padStart(2, '0'),
		(time % 1000).toString().padStart(3, '0')
	];
}

export function TimeIndicator() {
	const beatmap = useContext(BeatmapContext).beatmap;

	const currentTime = 72727;
	const totalTime = beatmap?.length || 0;

	const [curMin, curSec, curMs] = parseTime(currentTime);
	const [totalMin, totalSec, totalMs] = useMemo(() => parseTime(totalTime), [totalTime]);


	return (
		<div className="time-indicator">
			<div className="upper">
				<div className="current-time">
					<span className="min">{curMin}</span>
					<span className="colon">:</span>
					<span className="sec">{curSec}</span>
					<span className="dot">.</span>
					<span className="ms">{curMs}</span>
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
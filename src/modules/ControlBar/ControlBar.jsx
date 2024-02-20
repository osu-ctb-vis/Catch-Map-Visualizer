import { useContext, useRef } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { BeatmapContext } from '../../contexts/BeatmapContext'
import { TimeIndicator } from './TimeIndicator'
import { ProgressBar } from './ProgressBar'
import { ControlBtns } from './ControlBtns'
import clsx from 'clsx';
import './ControlBar.scss'

export function ControlBar() {
	const beatmap = useContext(BeatmapContext).beatmap;

	return (
		<div className={clsx("control-bar", {"show": !!beatmap})}>
			<TimeIndicator/>
			<ProgressBar/>
			<ControlBtns/>
		</div>
	)
}
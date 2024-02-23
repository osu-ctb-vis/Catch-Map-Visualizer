import { useContext, useRef } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { BeatmapsContext } from '../../contexts/BeatmapsContext'
import { TimeIndicator } from './TimeIndicator'
import { ProgressBar } from './ProgressBar'
import { ControlBtns } from './ControlBtns'
import clsx from 'clsx';
import './ControlBar.scss'

export function ControlBar() {
	const beatmap = useContext(BeatmapsContext).beatmaps?.at(-1);

	return (
		<div className={clsx("control-bar", {"show": !!beatmap})}>
			<TimeIndicator/>
			<ProgressBar/>
			<ControlBtns/>
		</div>
	)
}
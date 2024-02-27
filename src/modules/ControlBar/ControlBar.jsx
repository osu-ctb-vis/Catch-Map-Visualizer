import { useContext, useRef } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { BeatmapsContext } from '../../contexts/BeatmapsContext'
import { TimeIndicator } from './TimeIndicator'
import { ProgressBar } from './ProgressBar'
import { ControlBtns } from './ControlBtns'
import useTween from '../../hooks/useTween'
import clsx from 'clsx';
import './ControlBar.scss'

export function ControlBar() {
	const beatmap = useContext(BeatmapsContext).beatmaps?.at(-1);

	const [startTween, stopTween, extendTween] = useTween((t) => 1 - Math.pow(1 - t, 3));

	return (
		<div className={clsx("control-bar", {"show": !!beatmap})}>
			<TimeIndicator/>
			<ProgressBar startTween={startTween} stopTween={stopTween} extendTween={extendTween}/>
			<ControlBtns stopTween={stopTween}/>
		</div>
	)
}
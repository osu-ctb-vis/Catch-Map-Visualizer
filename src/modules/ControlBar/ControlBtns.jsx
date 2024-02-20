import { useContext, useState, useMemo, useEffect } from 'react'
import { PlayStateContext } from '../../contexts/PlayStateContext'
import { MdPlayArrow, MdPause } from 'react-icons/md'

import './ControlBtns.scss'

export function ControlBtns() {
	return (
		<div className="control-btns">
			<PlayPauseButton/>
		</div>
	)
}

function PlayPauseButton() {
	const {
		playing,
		setPlaying,
	} = useContext(PlayStateContext);

	return (
		<button
			className="control-btn play-btn"
			onClick={() => {
				setPlaying(!playing);
			}}
		>
			{playing ? <MdPause/> : <MdPlayArrow/>}
		</button>
	)
}
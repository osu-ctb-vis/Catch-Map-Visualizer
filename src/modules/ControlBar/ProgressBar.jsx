import { useContext, useRef, useState, useEffect, useCallback } from 'react'
import { PlayStateContext } from '../../contexts/PlayStateContext'
import { TimeIndicator } from './TimeIndicator'
import { ControlBtns } from './ControlBtns'
import clsx from 'clsx';
import './ProgressBar.scss'

export function ProgressBar() {
	// TODO: add density map
	// TODO: smooth transition on seek
	return (
		<div className="progress-bar">
			<ProgressBarSlider/>
		</div>
	)
}

function ProgressBarSlider() {
	const {
		playing,
		duration,
		playerRef
	} = useContext(PlayStateContext);

	const sliderRef = useRef(null);
	const handleRef = useRef(null);

	const [dragging, setDragging] = useState(false);

	const persent = playerRef.current?.currentTime / duration * 100;

	const updatePersent = useCallback((e) => {
		const rect = sliderRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const persent = x / rect.width;
		playerRef.current.currentTime = persent * duration;
	}, [duration]);

	const onMouseDown = (e) => {
		setDragging(true);
		updatePersent(e);
	}
	const onMouseUp = () => {
		setDragging(false);
	}

	useEffect(() => {
		sliderRef.current.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mouseup', onMouseUp);
		return () => {
			sliderRef.current.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mouseup', onMouseUp);
		}
	}, [duration, playing, playerRef.current]);

	useEffect(() => {
		if (dragging) {
			window.addEventListener('mousemove', updatePersent);
			return () => {
				window.removeEventListener('mousemove', updatePersent);
			}
		}
	}, [dragging]);

	return (
		<div className="progress-bar-slider" ref={sliderRef}>
			<div
				className="progress-bar-slider-handle"
				ref={handleRef}
				style={{left: `${persent}%`}}
			/>
		</div>
	)
}
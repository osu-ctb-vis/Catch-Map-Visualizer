import { useContext, useRef, useState, useEffect, useCallback } from 'react'
import { PlayStateContext } from '../../contexts/PlayStateContext'
import useTween from '../../hooks/useTween'
import { TimeIndicator } from './TimeIndicator'
import { ControlBtns } from './ControlBtns'
import clsx from 'clsx';
import './ProgressBar.scss'

export function ProgressBar(props) {
	// TODO: add density map
	// TODO: smooth transition on seek
	return (
		<div className="progress-bar">
			<ProgressBarSlider {...props}/>
		</div>
	)
}

function ProgressBarSlider({startTween, stopTween}) {
	const {
		playing,
		duration,
		playerRef
	} = useContext(PlayStateContext);

	const sliderRef = useRef(null);
	const handleRef = useRef(null);

	const [dragging, setDragging] = useState(false);

	const persent = playerRef.current?.currentTime / duration * 100;

	const getDurationByEvent = useCallback((e) => {
		const rect = sliderRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const persent = x / rect.width;
		return persent * duration;
	}, [duration]);

	const seek = (time) => {
		playerRef.current.currentTime = time;
	};

	const onMouseDown = (e) => {
		stopTween();
		setDragging(true);
		if (playing) {
			seek(getDurationByEvent(e));
		} else {
			const from = playerRef.current.currentTime;
			const to = getDurationByEvent(e);
			if (Math.abs(from - to) >= Math.max(duration / 5, 30)) {
				seek(to);
				return;
			}
			startTween((percent) => {
				seek(from + (to - from) * percent);
			}, 300);
		}
	}
	const onMouseUp = () => {
		setDragging(false);
	}
	const onMouseMove = (e) => {
		stopTween();
		seek(getDurationByEvent(e));
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
			window.addEventListener('mousemove', onMouseMove);
			return () => {
				window.removeEventListener('mousemove', onMouseMove);
			}
		}
	}, [dragging]);

	const onKeyDown = useCallback((e) => {
		let dir = 0;
		if (e.key === "ArrowRight") {
			dir = 1;
		} else if (e.key === "ArrowLeft") {
			dir = -1;
		} else {
			return;
		}
		let time = playerRef.current.currentTime + dir * 250 / 1000;
		if (time < 0) time = 0;
		if (time > duration) time = duration;
		if (playing) seek(time);
		else {
			const start = playerRef.current.currentTime;
			const stop = time;
			stopTween();
			startTween((t) => seek(start + (stop - start) * t), 250);
		}
	}, [duration, playing]);

	useEffect(() => {
		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
		}
	}, [duration, playing, playerRef.current]);

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
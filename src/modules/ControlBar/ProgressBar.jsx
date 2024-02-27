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

function ProgressBarSlider({startTween, stopTween, extendTween}) {
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


	const targetTime = useRef(null); // For fast scrolling

	useEffect(() => {
		targetTime.current = null;
	}, [duration]);

	const onKeyDownOrScroll = useCallback((e) => {
		let dir = 0, step = 250;
		let curTime = playerRef.current.currentTime;
		if (e.type === "keydown") {
			if (e.key === "ArrowRight" || e.key === "ArrowDown") {
				dir = 1;
				if (e.shiftKey) step = 1000;
				if (e.ctrlKey) step = 100;
				if (e.altKey) step = 5;
			}
			else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
				dir = -1; step = 250;
				if (e.shiftKey) step = 1000;
				if (e.ctrlKey) step = 100;
				if (e.altKey) step = 5;
			}
			else if (e.key === "PageUp") { dir = -1; step = 1500; }
			else if (e.key === "PageDown") { dir = 1; step = 1500; }
			else return;
		} else if (e.type === "wheel") {
			dir = e.deltaY < 0 ? -1 : 1;
			if (e.shiftKey) dir = -dir;
			step = 250;
			if (targetTime.current !== null && Math.sign(targetTime.current - curTime) === dir) {
				curTime = targetTime.current;
			}
		}
		let time = curTime + dir * step / 1000;
		if (e.type === "wheel") targetTime.current = time;
		if (time < 0) time = 0;
		if (time > duration) time = duration;
		if (playing) seek(time);
		else {
			const start = playerRef.current.currentTime;
			const stop = time;
			/*stopTween();
			startTween((t) => seek(start + (stop - start) * t), 250);*/
			extendTween((t) => seek(start + (stop - start) * t), 250, () => targetTime.current = null);
		}
	}, [duration, playing]);

	useEffect(() => {
		window.addEventListener('keydown', onKeyDownOrScroll);
		window.addEventListener('wheel', onKeyDownOrScroll);
		return () => {
			window.removeEventListener('keydown', onKeyDownOrScroll);
			window.removeEventListener('wheel', onKeyDownOrScroll);
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
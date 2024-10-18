import { createContext, useState, useRef, useContext, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";



export const AudioPlayback = forwardRef((props, ref) => {
	const {
		type = 'html', // 'html' | 'webaudio'
	} = props;

	return (
		type === 'html' ?
		<HTMLAudio ref={ref} {...props}/> :
		<WebAudio ref={ref} {...props}/>
	)
});


const HTMLAudio = forwardRef((props, ref) => {
	return (
		<audio
			ref={ref}
			style={{display: 'none'}}
			{ ...props }
		></audio>
	)
});

// TODO: entirely refactor this and related components
// Warning: WIP!
// TODO: fix playback speed related bugs
const WebAudio = forwardRef((props, ref) => {
	const {
		onTimeUpdate = () => {},
		onPlay = () => {},
		onPause = () => {},
		onEnded = () => {},
		onLoadedMetadata = () => {},
	} = props;

	// Simulate the behavior of HTMLAudioElement and expose, but with WebAudio API

	const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());

	const durationRef = useRef(0);
	const playingRef = useRef(false);

	const rawArrayBufferRef = useRef(null);
	const bufferRef = useRef(null);
	const sourceRef = useRef(null);
	const startTimeRef = useRef(0);
	const pausedAtRef = useRef(0);
	const playbackRateRef = useRef(1);
	
	useImperativeHandle(ref, () => ({
		set buffer(buffer) {
			console.log("Set buffer");
			rawArrayBufferRef.current = buffer;
			// TODO: stop the previous audio
		},
		async load() {
			const buffer = await audioContextRef.current.decodeAudioData(rawArrayBufferRef.current);
			bufferRef.current = buffer;
			durationRef.current = buffer.duration;
			console.log("duration", buffer.duration);
			onLoadedMetadata({ target: { duration: buffer.duration } });
			pausedAtRef.current = 0;
			console.log("Loaded");
		},
		play() {
			console.log("Play");
			if (playingRef.current) return;
			if (!bufferRef.current) return;
			if (audioContextRef.current.state === 'suspended') {
				audioContextRef.current.resume();
			}
			sourceRef.current = audioContextRef.current.createBufferSource();
			sourceRef.current.buffer = bufferRef.current;
			sourceRef.current.connect(audioContextRef.current.destination);
			sourceRef.current.playbackRate.value = playbackRateRef.current;
			sourceRef.current.start(0, pausedAtRef.current / playbackRateRef.current);
			playingRef.current = true;
			startTimeRef.current = audioContextRef.current.currentTime - pausedAtRef.current / playbackRateRef.current;
			onPlay();
		},
		pause() {
			if (!playingRef.current) return;
			if (!sourceRef.current) return;
			sourceRef.current.stop();
			pausedAtRef.current = (audioContextRef.current.currentTime - startTimeRef.current) * playbackRateRef.current;
			playingRef.current = false;
			onPause();
		},
		get currentTime() {
			if (!playingRef.current) return pausedAtRef.current;
			return (audioContextRef.current.currentTime - startTimeRef.current) * playbackRateRef.current;
		},
		set currentTime(value) {
			console.log("Set currentTime", value);
			if (playingRef.current) {
				console.log("Playing");
				sourceRef.current.stop();
				sourceRef.current = audioContextRef.current.createBufferSource();
				sourceRef.current.buffer = bufferRef.current;
				sourceRef.current.playbackRate.value = playbackRateRef.current;
				sourceRef.current.connect(audioContextRef.current.destination);
				sourceRef.current.start(0, value);
				startTimeRef.current = audioContextRef.current.currentTime - value / playbackRateRef.current;
			}
			pausedAtRef.current = value;
			onTimeUpdate({ target: { currentTime: value } });
		},
		get duration() {
			return durationRef.current;
		},
		get paused() {
			return !playingRef.current;
		},
		set playbackRate(value) {
			playbackRateRef.current = value;
			if (sourceRef.current) {
				startTimeRef.current = audioContextRef.current.currentTime - pausedAtRef.current / playbackRateRef.current;
				sourceRef.current.playbackRate.value = value;
			}
		},
		get playbackRate() {
			return playbackRateRef.current;
		}

	}), []);

	return null;

});
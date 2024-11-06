import { createContext, useState, useRef, useContext, useEffect, useCallback } from "react";
import { MapPackContext } from "./MapPackContext";
import { BeatmapsContext } from "./BeatmapsContext";
import { SettingsContext } from "./SettingsContext";
import { AudioPlayback } from "./AudioBackend/AudioPlayback";

export const PlayStateContext = createContext(null);

const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

export const PlayStateProvider = ({children}) => {
	const [playing, _setPlaying] = useState(false);
	const [duration, _setDuration] = useState(0);
	const [time, _setTime] = useState(0);
	const [playbackRate, _setPlaybackRate] = useState(1);

	const playerRef = useRef(null);

	const beatmap = useContext(BeatmapsContext).beatmaps?.at(-1);
	const zipFile = useContext(MapPackContext).mapPack?.zipFile;

	const oldAudioFileName = useRef(null);

	async function onBeatmapChange() {
		if (!beatmap) {
			if (playerRef?.current?.src) playerRef.current.src = "";
			oldAudioFileName.current = null;
			return;
		}
		const audioFileName = beatmap.general.audioFilename;
		if (oldAudioFileName.current === audioFileName) return;
		oldAudioFileName.current = audioFileName;
		const audioFile = zipFile?.[audioFileName];
		if (!audioFile) throw new Error("No audio file found in beatmap");
		const audioBuffer = await audioFile.async("arraybuffer");

		// two loading ways, first one for html audio, second one for webaudio
		playerRef.current.src = URL.createObjectURL(new Blob([audioBuffer]));
		playerRef.current.buffer = audioBuffer;

		await playerRef.current.load();
		playerRef.current.play();
	}

	useEffect(() => {
		oldAudioFileName.current = null;
	}, [zipFile]);

	useEffect(() => {
		onBeatmapChange();
	}, [beatmap]);

	const { gameSpeed, volume, setVolume: _setVolume} = useContext(SettingsContext);

	// playbackRate differs from gameSpeed as gameSpeed affects the catch moving speed
	const actualSpeed = clamp(gameSpeed * playbackRate, 0.065, 16);
	
	useEffect(() => {
		playerRef.current.playbackRate = actualSpeed;
	}, [actualSpeed]);

	const performanceNowRef = useRef(-1);
	const lastPlayerTimeRef = useRef(-1000);

	const getPreciseTime = useCallback(() => {
		if (!playerRef.current?.currentTime) return 0;
		// Firefox's audio.currentTime is not precise
		if (!isFirefox) return playerRef.current.currentTime * 1000;
		const playerTime = playerRef.current.currentTime * 1000;
		if (playerRef.current.paused) {
			return playerTime;
		}
		if (Math.abs(playerTime - lastPlayerTimeRef.current) > 1) {
			lastPlayerTimeRef.current = playerTime;
			performanceNowRef.current = performance.now();
			//console.log(playerTime);
			return playerTime;
		}
		//console.log(playerTime + performance.now() - performanceNowRef.current);
		return playerTime + performance.now() - performanceNowRef.current;
	}, [playing]);

	useEffect(() => {
		playerRef.current.volume = volume;
	}, []);

	return (
		<PlayStateContext.Provider value={{
			playing,
			duration,
			time, // not precise, for display only
			playbackRate,
			volume,
			playerRef,
			setPlaying: (value) => {
				if (value) playerRef.current.play();
				else playerRef.current.pause();
			},
			setTime: (value) => {
				value /= 1000;
				playerRef.current.currentTime = value;
				_setTime(value);
			},
			setPlaybackRate: (value) => {
				_setPlaybackRate(value);
			},
			setVolume: (value) => {
				playerRef.current.volume = value;
				_setVolume(value);
			},
			getPreciseTime
		}}>
			{children}
			<AudioPlayback
				ref={playerRef}
				style={{display: 'none'}}
				onTimeUpdate={(e) => {
					_setTime(e.target.currentTime * 1000);
				}}
				onPlay={() => _setPlaying(true)}
				onPause={() => _setPlaying(false)}
				onEnded={() => _setPlaying(false)}
				onLoadedMetadata={(e) => _setDuration(e.target.duration)}
			></AudioPlayback>
		</PlayStateContext.Provider>
	)
}
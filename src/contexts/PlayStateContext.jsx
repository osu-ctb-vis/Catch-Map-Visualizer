import { createContext, useState, useRef, useContext, useEffect } from "react";
import { MapPackContext } from "./MapPackContext";
import { BeatmapsContext } from "./BeatmapsContext";

export const PlayStateContext = createContext(null);

export const PlayStateProvider = ({children}) => {
	const [playing, _setPlaying] = useState(false);
	const [duration, _setDuration] = useState(0);
	const [time, _setTime] = useState(0);
	const [playbackRate, _setPlaybackRate] = useState(1);
	const [volume, _setVolume] = useState(1);

	const playerRef = useRef(null);

	const beatmap = useContext(BeatmapsContext).beatmaps?.at(-1);
	const zipFile = useContext(MapPackContext).mapPack?.zipFile;

	async function onBeatmapChange() {
		if (!beatmap) {
			if (playerRef?.current?.src) playerRef.current.src = "";
			return;
		}
		const audioFileName = beatmap.general.audioFilename;
		const audioFile = zipFile?.[audioFileName];
		if (!audioFile) throw new Error("No audio file found in beatmap");
		const audioBuffer = await audioFile.async("arraybuffer");
		playerRef.current.src = URL.createObjectURL(new Blob([audioBuffer]));
		playerRef.current.load();
		playerRef.current.play();
	}


	useEffect(() => {
		onBeatmapChange();
	}, [beatmap]);

	

	return (
		<PlayStateContext.Provider value={{
			playing,
			duration,
			time,
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
				playerRef.current.playbackRate = value;
				_setPlaybackRate(value);
			},
			setVolume: (value) => {
				playerRef.current.volume = value;
				_setVolume(value);
			},
		}}>
			{children}
			<audio
				ref={playerRef}
				style={{display: 'none'}}
				onTimeUpdate={(e) => {
					_setTime(e.target.currentTime * 1000);
				}}
				onPlay={() => _setPlaying(true)}
				onPause={() => _setPlaying(false)}
				onEnded={() => _setPlaying(false)}
				onLoadedMetadata={(e) => _setDuration(e.target.duration)}
			></audio>
		</PlayStateContext.Provider>
	)
}
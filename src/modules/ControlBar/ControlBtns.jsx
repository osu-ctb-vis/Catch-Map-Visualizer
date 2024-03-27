import { useContext, useState, useMemo, useEffect, useRef } from 'react'
import { PlayStateContext } from '../../contexts/PlayStateContext'
import { SettingsContext } from '../../contexts/SettingsContext'
import { MdPlayArrow, MdPause, MdVolumeUp, MdRefresh, MdVolumeDown, MdVolumeOff } from 'react-icons/md'
import clsx from 'clsx'

import './ControlBtns.scss'

export function ControlBtns(props) {
	return (
		<div className="control-btns">
			<div className="vertical-group">
				<PlaybackRateButton {...props}/>
				<VolumeButton {...props}/>
			</div>
			<PlayPauseButton {...props}/>
		</div>
	)
}

function PlayPauseButton({stopTween}) {
	const {
		playing,
		setPlaying,
	} = useContext(PlayStateContext);


	const onKeyDown = (e) => {
		if (e.repeat) return;
		if (e.key !== " ") return;
		if (e.target?.closest('input, textarea')) return;
		e.preventDefault();
		if (!playing) stopTween();
		setPlaying(!playing)
	}

	useEffect(() => {
		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
		}
	}, [playing]);

	return (
		<button
			className="control-btn play-btn"
			onClick={() => setPlaying(!playing)}
		>
			{playing ? <MdPause/> : <MdPlayArrow/>}
		</button>
	)
}

const formatSpeed = (speed) => {
	return speed.toFixed(2).replace(/0+$/, '').replace(/\.$/, '.0');
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function PlaybackRateButton(props) {
	const { gameSpeed } = useContext(SettingsContext);
	const { playbackRate, setPlaybackRate } = useContext(PlayStateContext);

	const formattedParts = formatSpeed(playbackRate).split('.');

	const actualSpeed = useMemo(() => clamp(gameSpeed * playbackRate, 0.065, 16), [gameSpeed, playbackRate]);

	//const [open, setOpen] = useState(false);

	return (
		<button
			className={clsx("control-btn playback-rate-btn", {open})}
		>
			<span>{formattedParts[0]}<span className="small">.{formattedParts[1]}x</span></span>
			<div className="control-btn-menu playback-rate-menu">
				<div className="control-btn-menu-title">
					Playback Rate
					{
						playbackRate !== 1 && (
							<MdRefresh
								className="slider-reset"
								onClick={() => setPlaybackRate(1)}
							/>
						)
					}
				</div>
				
				<ControlBtnMenuSlider
					min="0.1"
					max="2"
					step="0.01"
					value={playbackRate}
					onInput={(e) => {
						setPlaybackRate(parseFloat(e.target.value));
					}}
				/>
				<div className="control-btn-menu-annotation">
					{
						gameSpeed < 1 &&
						<span>
							{formatSpeed(playbackRate)}x * {formatSpeed(gameSpeed)}x (HT) =
						</span>
					}
					{
						gameSpeed > 1 &&
						<span>
							{formatSpeed(playbackRate)}x * {formatSpeed(gameSpeed)}x (DT) =
						</span>
					}
					<span>
						{formatSpeed(actualSpeed)}x
					</span>
				</div>
			</div>
		</button>
	)

}

function VolumeButton(props) {
	const { volume, setVolume } = useContext(PlayStateContext);

	const volumeSliderRef = useRef(null);

	const getUnmutedVolume = () => {
		const res = localStorage.getItem('unmutedVolume');
		if (!res) return 1;
		return parseFloat(res);
	}
	const setUnmutedVolume = (value) => {
		localStorage.setItem('unmutedVolume', value);
	}

	useEffect(() => {
		if (!volumeSliderRef.current) return;
		const onChange = (e) => {
			const val = parseFloat(e.target.value);
			if (val > 0) {
				setUnmutedVolume(val);
			}
			setVolume(val);
		};
		volumeSliderRef.current.addEventListener('change', onChange);
		return () => {
			volumeSliderRef.current.removeEventListener('change', onChange);
		}
	}, []);

	return (
		<button
			className={clsx("control-btn volume-btn", {open})}
			onClick={() => {
				if (volume > 0) {
					setUnmutedVolume(volume);
					setVolume(0);
				} else {
					setVolume(getUnmutedVolume());
				}
			}}
		>
			{ volume > 0.5 && <MdVolumeUp/> }
			{ volume <= 0.5 && volume > 0 && <MdVolumeDown/> }
			{ volume <= 0 && <MdVolumeOff/> }
			<div className="control-btn-menu volume-menu" onClick={(e) => e.stopPropagation()}>
				<div className="control-btn-menu-title">
					Volume
				</div>
				
				<ControlBtnMenuSlider
					min="0"
					max="1"
					step="0.01"
					value={volume}
					onInput={(e) => {
						setVolume(parseFloat(e.target.value));
					}}
					reference={volumeSliderRef}
				/>
				<div className="control-btn-menu-annotation">
					<span>
						{Math.round(volume * 100)}%
					</span>
				</div>
			</div>
		</button>
	)
}

function ControlBtnMenuSlider(props) {
	const ref = props?.reference ?? useRef(null);
	return (
		<input
			ref={ref}
			type="range"
			className="control-btn-menu-slider"
			{...props}
		/>
	)
}
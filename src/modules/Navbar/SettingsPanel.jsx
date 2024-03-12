import { useContext, useRef, useState } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { SettingsContext } from '../../contexts/SettingsContext'
import { MdRefresh, MdSettings } from "react-icons/md";
import ClickAwayListener from 'react-click-away-listener';
import clsx from 'clsx';
import './SettingsPanel.scss'


export function SettingsPanel () {
	const {
		verticalScale, setVerticalScale,
		showGrid, setShowGrid,
		derandomize, setDerandomize,
		hardRock, setHardRock,
		easy, setEasy,
		gameSpeed, setGameSpeed,
		showFPS, setShowFPS,
		backgroundDim, setBackgroundDim,
	} = useContext(SettingsContext);

	const [open, setOpen] = useState(false);

	const mapPack = useContext(MapPackContext).mapPack;
	const loaded = !!mapPack?.beatmaps?.length;

	return (
		<ClickAwayListener onClickAway={() => setOpen(false)}>
			<button
				className={clsx("settings-panel", {loaded, open})}
				onClick={() => {
					setOpen((prev) => !prev);
				}}
			>
				<MdSettings />
				<div className="settings-panel-menu" onClick={(e) => e.stopPropagation()}>
					<Checkbox
						label="Show Grid"
						description="Show grid lines on the playfield"
						value={showGrid}
						onChange={(value) => setShowGrid(value)}
					/>
					<Slider
						label="Background Dim"
						value={backgroundDim}
						min={0}
						max={1}
						step={0.01}
						defaultValue={0.8}
						percentage
						onChange={(value) => setBackgroundDim(value)}
					/>
					<Checkbox
						label="Derandomize"
						description="Don't apply random offset to the notes"
						value={derandomize}
						onChange={(value) => setDerandomize(value)}
					/>
					<div className="mods-selection">
						<Mod
							label="Hard Rock"
							acronym="HR"
							description="Increase the difficulty of the map"
							value={hardRock}
							onChange={(value) => {
								setHardRock(value);
								if (value) setEasy(false);
							}}
						/>
						<Mod
							label="Easy"
							acronym="EZ"
							description="Decrease the difficulty of the map"
							value={easy}
							onChange={(value) => {
								setEasy(value);
								if (value) setHardRock(false);
							}}
						/>
						<Mod
							label="Double Time"
							acronym="DT"
							description="Increase the speed of the map"
							value={gameSpeed === 1.5}
							semiSelected={gameSpeed > 1}
							onChange={(value) => setGameSpeed(value ? 1.5 : 1)}
						/>
						<Mod
							label="Half Time"
							acronym="HT"
							description="Decrease the speed of the map"
							value={gameSpeed === 0.75}
							semiSelected={gameSpeed < 1}
							onChange={(value) => setGameSpeed(value ? 0.75 : 1)}
						/>
					</div>
					<Slider
						label="Game Speed"
						value={gameSpeed}
						min={0.1}
						max={2}
						step={0.01}
						defaultValue={1}
						suffix="x"
						onChange={(value) => setGameSpeed(value)}
					/>

					<Checkbox
						label="Hard Rock"
						description="Increase the difficulty of the map"
						value={hardRock}
						onChange={(value) => {
							setHardRock(value);
							if (value) setEasy(false);
						}}
					/>
					<Checkbox
						label="Easy"
						description="Decrease the difficulty of the map"
						value={easy}
						onChange={(value) => {
							setEasy(value);
							if (value) setHardRock(false);
						}}
					/>
					<Slider
						label="Vertical Scale"
						value={verticalScale}
						min={0.5}
						max={5}
						step={0.1}
						defaultValue={1}
						onChange={(value) => setVerticalScale(value)}
					/>
					<Checkbox
						label="Show FPS"
						description="Show performance monitor"
						value={showFPS}
						onChange={(value) => {
							setShowFPS(value);
						}}
					/>
				</div>
			</button>
		</ClickAwayListener>
	)
}

function Checkbox({label, description, value, onChange}) {
	return (
		<div className={clsx("checkbox", {checked: value})} onClick={() => onChange(!value)}>
			<div className="checkbox-box"></div>
			<div className="checkbox-content">
				<div className="checkbox-label">{label}</div>
				{description && <div className="checkbox-description">{description}</div>}
			</div>
		</div>
	)
}

function Slider({ label, value, min, max, step, onChange, defaultValue, percentage, suffix }) {
	const toFixedPrecision = Math.max(0, -Math.floor(Math.log10(step) + (percentage ? 2 : 0)));
	return (
		<div className="slider">
			<div className="slider-content">
				<div className="slider-label">{label}</div>
				{
					defaultValue !== undefined && value !== defaultValue && (
						<MdRefresh
							className="slider-reset"
							onClick={() => onChange(defaultValue)}
						/>
					)
				}
				<div className="slider-value">{ percentage ? `${(value * 100).toFixed(toFixedPrecision)}%` : value.toFixed(toFixedPrecision)}{suffix ?? ""}</div>
			</div>
			<div className="slider-bar">
				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value}
					onChange={(e) => onChange(parseFloat(e.target.value))}
				/>

			</div>
			
		</div>
	)
}

function Mod({ label, acronym, description, semiSelected, value, onChange }) {
	return (
		<div className={clsx("mod", {selected: value, 'semi-selected': semiSelected})} onClick={() => onChange(!value)}>
			<div className="mod-acronym">{acronym}</div>
			<div className="mod-label">{label}</div>
		</div>
	)
}
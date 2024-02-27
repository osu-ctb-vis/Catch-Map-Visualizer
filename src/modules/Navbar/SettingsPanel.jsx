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
		showFPS, setShowFPS
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
					<Checkbox
						label="Derandomize"
						description="Don't apply random offset to the notes"
						value={derandomize}
						onChange={(value) => setDerandomize(value)}
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

function Slider({ label, value, min, max, step, onChange, defaultValue }) {
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
				<div className="slider-value">{value.toFixed(1)}</div>
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
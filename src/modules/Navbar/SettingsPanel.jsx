import { useContext, useRef, useState } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { SettingsContext } from '../../contexts/SettingsContext'
import { MdSettings } from "react-icons/md";
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
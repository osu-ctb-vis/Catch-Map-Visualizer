import { useContext, useRef, useState } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { SettingsContext } from '../../contexts/SettingsContext'
import { MdSettings } from "react-icons/md";
import ClickAwayListener from 'react-click-away-listener';
import clsx from 'clsx';
import './SettingsPanel.scss'


export function SettingsPanel () {
	const {verticalScale, setVerticalScale} = useContext(SettingsContext);

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
				<div className="settings-panel-menu">
					Vertical scale: {verticalScale}
				</div>
			</button>
		</ClickAwayListener>
	)
}
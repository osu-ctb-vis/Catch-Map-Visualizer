import { useContext, useRef, useState } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { SettingsContext } from '../../contexts/SettingsContext'
import { SkinContext } from '../../contexts/SkinContext'
import { MdRefresh, MdSettings } from "react-icons/md";
import ClickAwayListener from 'react-click-away-listener';
import clsx from 'clsx';
import './SettingsPanel.scss'


export function SettingsPanel () {
	const {
		verticalScale, setVerticalScale,
		maxSpinLeniency, setMaxSpinLeniency,
		showGrid, setShowGrid,
		derandomize, setDerandomize,
		hardRock, setHardRock,
		easy, setEasy,
		gameSpeed, setGameSpeed,
		showBananaPathShade, setShowBananaPathShade,
		showFPS, setShowFPS,
		backgroundDim, setBackgroundDim,
		useLegacyDOMRenderer, setUseLegacyDOMRenderer,
		skinnedCatcher, setSkinnedCatcher
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
				<div className="settings-panel-menu" onClick={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
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
						{/* <Mod
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
						/> */}
					</div>
					{/* <Slider
						label="Game Speed"
						value={gameSpeed}
						min={0.1}
						max={2}
						step={0.01}
						defaultValue={1}
						suffix="x"
						onChange={(value) => setGameSpeed(value)}
					/> */}
					<Slider
						label="Vertical Scale"
						value={verticalScale}
						min={0.5}
						max={5}
						step={0.1}
						defaultValue={1}
						onChange={(value) => setVerticalScale(value)}
					/>
					<Slider
						label="Max Spin Leniency"
						description="Higher value = less pixel movements"
						value={maxSpinLeniency}
						min={0}
						max={0.5}
						step={0.01}
						defaultValue={0.2}
						onChange={(value) => setMaxSpinLeniency(value)}
					/>
					<Checkbox
						label="Show Banana Path Shade"
						description="Visualize the catcher path for bananas"
						value={showBananaPathShade}
						onChange={(value) => {
							setShowBananaPathShade(value);
						}}
					/>
					<Checkbox
						label="Show FPS"
						description="Show performance monitor"
						value={showFPS}
						onChange={(value) => {
							setShowFPS(value);
						}}
					/>
					<Checkbox
						label="Use Legacy DOM Renderer"
						description="Low performance, not recommended"
						value={useLegacyDOMRenderer}
						onChange={(value) => setUseLegacyDOMRenderer(value)}
					/>
					<SkinSelector />
					<Checkbox
						label="Skinned Catcher"
						description="Apply skin to the catcher"
						value={skinnedCatcher}
						onChange={(value) => setSkinnedCatcher(value)}
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

function Slider({ label, value, min, max, step, onChange, defaultValue, percentage, suffix, description }) {
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
			{
				description && <div className="slider-description">{description}</div>
			}
			
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

// TODO: Seperate skin selector into a new file

function SkinSelector() {
	const {
		skinID, loadPresetSkin, loadLocalSkin, localSkins, deleteSkin
	} = useContext(SkinContext);
	
	return (
		<div className="skin-selector">
			<div className="skin-selector-title">
				Skin
			</div>
			<div className="skin-selector-description">
				Drag and drop .osk files to import skins
			</div>
			<div className="skin-selector-content">
				<Skin id="default-classic" name="Default - Classic" onSelect={() => loadPresetSkin("default-classic")} selected={skinID === "default-classic"} />
				<Skin id="default-simple" name="Default - Simple" onSelect={() => loadPresetSkin("default-simple")} selected={skinID === "default-simple"} />
				{
					localSkins.map((skin) => (
						<Skin
							key={skin.id}
							id={skin.id}
							name={skin.skin.name}
							onSelect={() => loadLocalSkin(skin.id)}
							selected={skinID === skin.id}
							canDelete
							onDelete={() => {
								deleteSkin(skin.id);
							}}
						/>
					))
				}
			</div>
		</div>
	)
}

function Skin({ id, name, onSelect, selected, canDelete = false, onDelete }) {
	return (
		<div 
			className={clsx("skin-item", {selected})}
			onClick={onSelect}
			title={name}
		>
			<div className="skin-item-name">{name}</div>
			{
				canDelete && 
				<div className="delete-button" role="button" onClick={(e) => {
					e.stopPropagation();
					onDelete();
				}}>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
				</div>
			}
		</div>
	)
}
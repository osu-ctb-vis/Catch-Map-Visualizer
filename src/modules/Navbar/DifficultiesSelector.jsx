import { useContext, useState, useLayoutEffect, useRef, useMemo } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { BeatmapsContext } from '../../contexts/BeatmapsContext'
import { groupAndSortMaps } from '../../utils/GroupAndSortMaps'
import { MdArrowDropDown, MdCheck } from "react-icons/md";
import { RulesetIcon } from '../Components/RulesetIcon/RulesetIcon';
import clsx from 'clsx';
import ClickAwayListener from 'react-click-away-listener';
import './DifficultiesSelector.scss'


export function DifficultiesSelector () {
	const AllBeatmaps = useContext(MapPackContext).mapPack?.beatmaps ?? null;

	const {beatmaps, setBeatmaps} = useContext(BeatmapsContext);
	
	const currentDifficulties = beatmaps?.map((beatmap) => beatmap.metadata.version) ?? [];

	const [open, setOpen] = useState(false);

	const listRef = useRef(null);

	useLayoutEffect(() => {
		if (!open) return;
		const selectedEntries = listRef.current.querySelectorAll('.selected');
		if (!selectedEntries.length) return;
		const selected = selectedEntries[Math.floor(selectedEntries.length / 2)];
		if (!listRef.current) return;
		listRef.current.scrollTop = selected.offsetTop - listRef.current.offsetHeight / 2;
	}, [open]);

	const groups = useMemo(() => groupAndSortMaps(AllBeatmaps), [AllBeatmaps]);
	
	if (!AllBeatmaps) return null;

	const noDifficulyAvailable = AllBeatmaps.every((beatmap) => ![0, 2].includes(beatmap.originalMode));

	return (
		<ClickAwayListener onClickAway={() => setOpen(false)}>
			<div
				className={clsx("nav-difficulties-selector", {open, "no-difficulty": noDifficulyAvailable})}
				onClick={() => setOpen((prev) => !prev)}
			>
				<div className="current-difficulty">
					{noDifficulyAvailable && "No difficulty available"}
					{!noDifficulyAvailable && currentDifficulties.length === 0 && "Select a difficulty"}
					{!noDifficulyAvailable && currentDifficulties.length > 0 && currentDifficulties.join(", ")}
				</div>
				<MdArrowDropDown className="dropdown-icon"/>
				<div className="difficulties-list" onClick={(e) => e.stopPropagation()} ref={listRef}>
					{
						groups.map((group, i) => (
							<Section
								key={i}
								group={group}
								currentDifficulties={currentDifficulties}
								beatmaps={beatmaps}
								setBeatmaps={setBeatmaps}
								showTitle={groups.length > 1}
							/>
						))
					}
				</div>
			</div>
		</ClickAwayListener>			
	)
}

function Section ({group, currentDifficulties, beatmaps, setBeatmaps, showTitle}) {
	return (
		<div className="nav-difficulties-selector-section">
			{
				showTitle && <div className="section-title">{group.name}</div>
			}
			{
				group.beatmaps.map((beatmap, i) => (
					<Difficulty
						key={i}
						beatmap={beatmap}
						currentDifficulties={currentDifficulties}
						beatmaps={beatmaps}
						setBeatmaps={setBeatmaps}
					/>
				))
			}
		</div>
	)
}

function Difficulty ({beatmap, currentDifficulties, beatmaps, setBeatmaps}) {
	const selected = currentDifficulties.includes(beatmap.metadata.version);
	return (
		<div
			className={clsx(
				"difficulty",
				{
					"selected": currentDifficulties.includes(beatmap.metadata.version),
					"disabled": ![0, 2].includes(beatmap.originalMode)
				}
			)}
			onClick={() => {
				if (![0, 2].includes(beatmap.originalMode)) return;
				if (selected) {
					setBeatmaps(beatmaps.filter((d) => d.metadata.version !== beatmap.metadata.version));
				} else {
					const newBeatmaps = beatmaps?.at(-1)?.general?.audioFilename === beatmap.general.audioFilename ? beatmaps : [];
					setBeatmaps([...newBeatmaps, beatmap].sort((a, b) => a.hitObjects.length - b.hitObjects.length));
				}
			}}
		>
			<RulesetIcon ruleset={beatmap.originalMode} className="difficulty-ruleset-icon"/>
			<div className="difficulty-info">
				<div className="difficulty-name">
					{beatmap.metadata.version}
				</div>
				<div className="difficulty-author">
					{beatmap.metadata.creator}
				</div>
			</div>
			<div className="difficulty-selected-icon">
				<MdCheck/>
			</div>
		</div>
	)
}
import { useContext, useState, useLayoutEffect, useRef } from 'react'
import { MapPackContext } from '../../contexts/MapPackContext'
import { BeatmapContext } from '../../contexts/BeatmapContext'
import './DifficultiesSelector.scss'
import { MdArrowDropDown, MdCheck } from "react-icons/md";
import { RulesetIcon } from '../Components/RulesetIcon/RulesetIcon';
import clsx from 'clsx';
import ClickAwayListener from 'react-click-away-listener';


export function DifficultiesSelector () {
	const mapPack = useContext(MapPackContext).mapPack;
	const {beatmap, setBeatmap} = useContext(BeatmapContext)
	
	const currentDifficulty = beatmap?.metadata?.version ?? null;

	const [open, setOpen] = useState(false);

	const listRef = useRef(null);

	useLayoutEffect(() => {
		if (!open) return;
		const selected = listRef.current.querySelector('.selected');
		if (!selected) return;
		if (!listRef.current) return;
		listRef.current.scrollTop = selected.offsetTop - listRef.current.offsetHeight / 2;
	}, [open, beatmap]);

	if (!mapPack) return null;

	const noDifficulyAvailable = mapPack.beatmaps.every((beatmap) => ![0, 2].includes(beatmap.originalMode));

	return (
		<ClickAwayListener onClickAway={() => setOpen(false)}>
			<div
				className={clsx("nav-difficulties-selector", {open, "no-difficulty": noDifficulyAvailable})}
				onClick={() => setOpen((prev) => !prev)}
			>
				<div className="current-difficulty">
					{!noDifficulyAvailable ? currentDifficulty : "No difficulty available"}
				</div>
				<MdArrowDropDown className="dropdown-icon"/>
				<div className="difficulties-list" onClick={(e) => e.stopPropagation()} ref={listRef}>
					{mapPack?.beatmaps.map((beatmap, i) => (
						<div
							key={i}
							className={clsx(
								"difficulty",
								{
									"selected": beatmap.metadata.version === currentDifficulty,
									"disabled": ![0, 2].includes(beatmap.originalMode)
								}
							)}
							onClick={() => {
								if (![0, 2].includes(beatmap.originalMode)) return;
								setOpen(false);
								beatmap.metadata.version !== currentDifficulty && setBeatmap(beatmap);
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
								{beatmap.metadata.version === currentDifficulty && <MdCheck/>}
							</div>
						</div>
					))}
				</div>
			</div>
		</ClickAwayListener>			
	)
}
import { useRef, useState, useEffect, useLayoutEffect, useMemo } from "react";
import { SettingsContext } from "../../../contexts/SettingsContext";
import clsx from "clsx";
import "./StatsOverlay.scss";

export function StatsOverlay({ beatmap, ctbObjects, progress, calculating }) {

	const [show, setShow] = useState(true);
	
	const hideProgress = isNaN(progress);

	if (progress > 1) progress = 1;
	progress = (progress * 100).toFixed(0);


	const ref = useRef(null);

	useEffect(() => {
		if (calculating) {
			setShow(true);
		}
	}, [calculating]);

	if (!show) return null;

	const bananas = useMemo(() => ctbObjects.filter(o => o.type === "banana").length, [ctbObjects, calculating]);
	const missedBananas = useMemo(() => ctbObjects.filter(o => o.type === "banana" && o.bananaMissed).length, [ctbObjects, calculating]);
	const catchedBananas = useMemo(() => bananas - missedBananas, [bananas, missedBananas]);

	return (
		<div
			className={clsx("stats-overlay")}
			ref={ref}
		>
			<div className="stats-overlay-title">
				Stats
			</div>
			<div className="stats-overlay-content">
				{
					/* TODO: improve performance here */
				}
				<Section title="Beatmap"/>
				<Item title="Circle Size" value={beatmap.difficulty.circleSize} />
				<Item title="Approach Rate" value={beatmap.difficulty.approachRate} />
				<Item title="Drain Rate" value={beatmap.difficulty.drainRate} />
				<Item title="Overall Difficulty" value={beatmap.difficulty.overallDifficulty} />
				<Section title="Objects"/>
				<Item title="Total" value={ctbObjects.length} />
				<Item title="Fruits" value={ctbObjects.filter(o => o.type === "fruit").length} />
				<Item title="Drops" value={ctbObjects.filter(o => o.type === "drop").length} />
				<Item title="Droplets" value={ctbObjects.filter(o => o.type === "droplet").length} />
				<Item title="Bananas" value={ctbObjects.filter(o => o.type === "banana").length} />
				<Section title="Banana path"/>
				{
					calculating ? (
						<Item title="Calculating" value={`${progress}%`} />
					) : (
						<>
							<Item title="Catched" value={catchedBananas} />
							<Item title="Missed" value={missedBananas} />
							<Item title="Catch rate" value={`${(catchedBananas / bananas * 100).toFixed(2)}%`} />
						</>
					)
				}
			</div>
		</div>
	)
}

function Section({ title }) {
	return (
		<div className="stats-overlay-section">
			{title}
		</div>
	)
}

function Item({ title, value }) {
	return (
		<div className="stats-overlay-item">
			<div className="stats-overlay-item-name">{title}</div>
			<div className="stats-overlay-item-value">{value}</div>
		</div>
	)
}
import { useRef, useState, useEffect, useLayoutEffect, useContext } from "react";
import { SettingsContext } from "../../../contexts/SettingsContext";
import clsx from "clsx";
import "./BananaPathCalculatingOverlay.scss";

export function BananaPathCalculatingOverlay({ progress, calculating}) {

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

	return (
		<div
			className={clsx("banana-path-calculating-overlay", {hide: !calculating})}
			ref={ref}
			onTransitionEnd={() => {
				if (getComputedStyle(ref.current).opacity === "0") {
					setShow(false);
				} else {
					setShow(true);
				}
			}}
		>
			<div className="banana-path-calculating-overlay-spinner"></div>
			<div className="banana-path-calculating-overlay-right">
				<div className="banana-path-calculating-overlay-title">Calculating path</div>
				<div className="banana-path-calculating-overlay-progress">{progress}%</div>
			</div>
		</div>
	)
}
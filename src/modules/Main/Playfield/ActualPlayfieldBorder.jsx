import { useContext } from "react";
import { SettingsContext } from "../../../contexts/SettingsContext";
import "./ActualPlayfieldBorder.scss";


export function ActualPlayfieldBorder() {
	//const verticalScale = useContext(SettingsContext).verticalScale;

	//const aspectRatio = `4 / ${3 / verticalScale}`;
	return (
		<div
			className="actual-Playfield-border"
			style={{
				//aspectRatio
			}}
		>
			<div/><div/><div/><div/>
		</div>
	)
}
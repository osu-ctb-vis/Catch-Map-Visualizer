import { useRef, useState, useEffect, useLayoutEffect, useContext } from "react";
import { SettingsContext } from "../../../contexts/SettingsContext";
import clsx from "clsx";
import "./Grids.scss";

export function Grids() {
	const ref = useRef(null);

	const horizontalGrids = 20;

	const [width, setWidth] = useState(0);
	const onResize = () => {
		setWidth(ref.current.offsetWidth);
	};

	useLayoutEffect(() => {
		onResize();
	}, []);

	useEffect(() => {
		const resizeObserver = new ResizeObserver(onResize);
		resizeObserver.observe(ref.current);
		return () => resizeObserver.disconnect();
	}, []);


	const gridSize = width / horizontalGrids;

	const showGrid = useContext(SettingsContext).showGrid;
	


	return (
		<div
			className={clsx("grids", { hidden: !showGrid })}
			ref={ref}
			style={{
				...((gridSize === 0) ? {} : { "--grid-size": gridSize + "px" })
			}}

		/>
	)
}
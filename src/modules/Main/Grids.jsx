import { useRef, useState, useEffect, useLayoutEffect } from "react";
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
	


	return (
		<div
			className="grids"
			ref={ref}
			style={{
				...((gridSize === 0) ? {} : { "--grid-size": gridSize + "px" })
			}}

		/>
	)
}
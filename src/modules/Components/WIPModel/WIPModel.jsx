import clsx from "clsx";
import React, { useState } from "react";
import "./WIPModel.scss";

const inDevelopmentBuild = import.meta.env.DEV;

export function WIPModel({ ...props }) {
	const [closed, setClosed] = useState(inDevelopmentBuild || sessionStorage.getItem("wip-closed") === "true");
	const [hidden, setHidden] = useState(false);

	const onclose = () => {
		setClosed(true);
		sessionStorage.setItem("wip-closed", "true");
		setTimeout(() => setHidden(true), 500);
	}

	if (hidden) return null;

	return (
		<div className={clsx("wip-model-mask", { closed })}>
			<div className="wip-model">
				<div className="wip-model-title">🥺 Warning!</div>
				<div className="wip-model-content">
					This project is still under development and in its <i>very</i> early stages. <br />
					Most of the features are not  mplemented yet. Some functionalities may not work as expected. <br />
					Any kind of error or bug may occur.
				</div>
				<div className="wip-model-buttons">
					<button onClick={onclose}>I know!</button>
				</div>
			</div>
		</div>
	);
}
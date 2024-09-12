import clsx from "clsx";
import "./WidthTransitionText.scss";

export function WidthTransitionText({ children, hidden, ...props }) {

	return (
		<div className={clsx("width-transition-text", {hidden})} {...props}>
			<div className="inner">
				{children}
			</div>
		</div>
	)
}
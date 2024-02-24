import { Background } from './Background';
import { PlayfieldsContainer } from './PlayfieldsContainer';
import "./Main.scss";

export function Main() {
	return (
		<div className="main">
			<Background />
			<PlayfieldsContainer />
		</div>
	)
}
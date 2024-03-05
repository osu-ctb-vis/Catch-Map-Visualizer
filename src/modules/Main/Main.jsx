import { Background } from './Background';
import { PlayfieldsContainer } from './Playfield/PlayfieldsContainer';
import "./Main.scss";

export function Main() {
	return (
		<div className="main">
			<Background />
			<PlayfieldsContainer />
		</div>
	)
}
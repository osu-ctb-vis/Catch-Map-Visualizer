import "./MonospacedNumber.scss";

export function MonospacedNumber({ children }) {
	if (typeof children === 'object') children = children[0];
	const str = children.toString();
	return (
		<>
			{str.split('').map((c, i) => <span key={i} className="monospaced-digit">{c}</span>)}
		</>
	)
}
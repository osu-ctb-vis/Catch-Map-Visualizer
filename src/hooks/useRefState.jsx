import { useRef, useState } from 'react';

export default function useRefState(initialValue) {
	const [state, setState] = useState(initialValue);
	const stateRef = useRef(state);
	stateRef.current = state;

	const setRefState = (newState) => {
		setState(newState);
		stateRef.current = newState;
	}

	return [state, stateRef, setRefState];
}
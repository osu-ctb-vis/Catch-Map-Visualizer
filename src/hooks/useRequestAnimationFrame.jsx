import { useRef } from 'react';

export default function useRequestAnimationFrame(onFrame) {
	const requestRef = useRef();
	const previousTimeRef = useRef();

	const animate = time => {
		if (previousTimeRef.current != undefined) {
			const deltaTime = time - previousTimeRef.current;
			onFrame(deltaTime);
		}
		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	}

	const start = () => {
		requestRef.current = requestAnimationFrame(animate);
	}

	const stop = () => {
		cancelAnimationFrame(requestRef.current);
	}

	return [ start, stop ];
}
	
import { useRef } from 'react';

export default function useTween(easing = (x) => x) {
	const fnRef = useRef(() => {});
	const time = useRef(0);
	const startTime = useRef(null);
	const animation = useRef(null);
	const easingRef = useRef(easing);
	const durationRef = useRef(0);
	const start = (fn, duration, easing = null) => {
		if (easing) easingRef.current = easing;
		fnRef.current = fn;
		time.current = null;
		startTime.current = null;
		durationRef.current = duration;
		fn(easingRef.current(0), 0);
		animation.current = requestAnimationFrame(update);
	}
	const stop = () => {
		cancelAnimationFrame(animation.current);
		animation.current = null;
	}
	const update = (absTime) => {
		if (!startTime.current) startTime.current = absTime;
		time.current = absTime - startTime.current;
		if (time.current > durationRef.current) {
			fnRef.current(easingRef.current(1), durationRef.current);
			stop();
			return;
		}
		fnRef.current(easingRef.current(time.current / durationRef.current), time.current);
		animation.current = requestAnimationFrame(update);
	}
	return [start, stop];
}
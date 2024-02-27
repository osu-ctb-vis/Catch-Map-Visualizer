import { useRef } from 'react';

export default function useTween(easing = (x) => x) {
	const fnRef = useRef(() => {});
	const time = useRef(0);
	const startTime = useRef(null);
	const animation = useRef(null);
	const easingRef = useRef(easing);
	const durationRef = useRef(0);
	const onEndRef = useRef(() => {});

	const percentCut = useRef(0);

	const start = (fn, duration, onEnd = () => {}) => {
		if (animation.current !== null) {
			onEndRef.current();
			cancelAnimationFrame(animation.current);
		}
		fnRef.current = fn;
		onEndRef.current = onEnd;
		time.current = null;
		startTime.current = null;
		durationRef.current = duration;
		percentCut.current = 0;
		fn(easingRef.current(0), 0);
		animation.current = requestAnimationFrame(update);
	}
	const extend = (fn, defaultDuration = null, onEnd = null) => {
		// extend from a certain time, at which the velocity is same as the last frame
		// assume the easing function is symmetric at 0.5 cause i am lazy and currently we only used 1 - (1 - x)^3 which is symmetric
		if (onEnd) onEndRef.current = onEnd;
		if (animation.current === null) {
			percentCut.current = 0;
			start(fn, defaultDuration);
			return;
		}
		cancelAnimationFrame(animation.current);
		let newStartTime = time.current;
		if (newStartTime > durationRef.current / 2) {
			newStartTime = durationRef.current - newStartTime;
		}
		fnRef.current = fn;
		startTime.current = performance.now() - newStartTime;
		percentCut.current = easingRef.current(newStartTime / durationRef.current);
		fn((easingRef.current(newStartTime / durationRef.current) - percentCut.current) / (1 - percentCut.current), newStartTime);
		animation.current = requestAnimationFrame(update);
	}
	const stop = () => {
		cancelAnimationFrame(animation.current);
		animation.current = null;
		onEndRef.current();
	}
	const update = (absTime) => {
		if (!startTime.current) startTime.current = absTime;
		time.current = absTime - startTime.current;
		if (time.current > durationRef.current) {
			fnRef.current(easingRef.current(1), durationRef.current);
			stop();
			return;
		}
		//fnRef.current(easingRef.current(time.current / durationRef.current), time.current);
		fnRef.current((easingRef.current(time.current / durationRef.current) - percentCut.current) / (1 - percentCut.current), time.current);
		animation.current = requestAnimationFrame(update);
	}
	return [start, stop, extend];
}
import { useRef } from 'react';

export default function useRefMemo(f, deps) {
	const depsRef = useRef([]);
	const ref = useRef(null);
	if (depsRef.current.length !== deps.length || depsRef.current.some((v, i) => v !== deps[i])) {
		console.log('changed');
		depsRef.current = deps;
		ref.current = f();
	}
	return [ref.current, ref];
}
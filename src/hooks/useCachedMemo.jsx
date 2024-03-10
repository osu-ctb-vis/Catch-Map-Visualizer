import { useRef, useMemo } from 'react';

export default function useCachedMemo(f, deps) {
	const ref = useRef({});
	const lookup = () => {
		const key = deps.map(d => d.toString()).join(",");
		if (!ref.current[key]) ref.current[key] = f();
		return ref.current[key];
	};
	return useMemo(lookup, deps);	
}
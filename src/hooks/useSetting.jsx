import { useRef, useState } from 'react';

export default function useSetting(name, defaultValue, save = false) {
	if (save && localStorage.getItem(name)) {
		defaultValue = JSON.parse(localStorage.getItem(name));
	}
	const [value, setValue] = useState(defaultValue);
	const ref = useRef(value);
	ref.current = value;
	const set = (newValue) => {
		setValue(newValue);
		ref.current = newValue;
		if (save) {
			localStorage.setItem(name, JSON.stringify(newValue));
		}
	}
	return [value, ref, set];
}
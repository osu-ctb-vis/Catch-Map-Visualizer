export function humanFileSize(size, binary = false) {
	const base = binary ? 1024 : 1000;
	const units = binary
		? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
		: ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let unit = 0;
	while (size >= base && unit < units.length - 1) {
		size /= base;
		unit++;
	}
	return `${size.toFixed(2)} ${units[unit]}`;
}
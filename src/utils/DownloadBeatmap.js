export function downloadBeatmap(beatmapID, mirrorHost, onProgress = () => { }, onFinished = () => { }, onError = () => { }) {
	const controller = new AbortController();
	const signal = controller.signal;

	const URL = mirrorHost == 'sayobot'
		? `https://txy1.sayobot.cn/beatmaps/download/mini/${beatmapID}?server=auto`
		: mirrorHost == 'mino'
			? `https://catboy.best/d/${beatmapID}`
			: mirrorHost == 'osudirect'
				? `https://osu.direct/api/d/${beatmapID}`
				: 'mino';
	console.log(URL, mirrorHost);

	const abort = () => {
		controller.abort();
	}

	const download = async () => {
		let response;
		try {
			response = await fetch(URL, { signal });
		} catch (error) {
			if (error.name === 'AbortError') {
				console.log('Downloading aborted');
				return;
			} else {
				onError(error);
				throw error;
			}
		}

		const reader = response.body.getReader();

		console.log(response.headers);

		const contentLength = +response.headers.get('Content-Length');

		let receivedLength = 0;
		let chunks = [];

		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			chunks.push(value);
			receivedLength += value.length;

			onProgress(receivedLength, contentLength);
		}

		let chunksAll = new Uint8Array(receivedLength);
		let position = 0;
		for (let chunk of chunks) {
			chunksAll.set(chunk, position);
			position += chunk.length;
		}

		onFinished(chunksAll);

		return chunksAll;
	}
	return [download, abort];
}

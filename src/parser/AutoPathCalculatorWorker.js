import { calculateAutoPath, initWasm } from './AutoPathCalculator';


self.addEventListener('message', async (event) => {
	console.log('Worker received message');
	console.log(event);
	try {
		console.log('Worker importing wasm');
		const wasmInstance = await initWasm();
		console.log('Worker wasm initialized');
		console.log(wasmInstance);
		wasmInstance.onProgress = function (current, total) {
			self.postMessage({ progress: { current, total } });
		};

		
		const result = await calculateAutoPath(...event.data.params, wasmInstance);
		console.log(result);
		console.log('Worker sending message');
		self.postMessage({ result });
	} catch (e) {
		self.postMessage({ error: e.message });
	}
});
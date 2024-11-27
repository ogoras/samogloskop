import drfti1 from './drfti1.js';
import drftf1 from './forward/drftf1.js';
import drftb1 from './backward/drftb1.js';

// NUMforwardRealFastFourierTransform in Praat
export function fft(data) {
    const n = data.length;
    const trigcache = new Float64Array(3 * n);
    const splitcache = new Int32Array(32);
    if (n === 1) return;
    drfti1(n, trigcache, splitcache, n);
    drftf1(n, data, trigcache, splitcache, n);
	// if (data.size > 1) {
	// 	/*
	// 		To be compatible with old behaviour.
	// 	*/
	// 	let tmp = data [data.length];
	// 	for (let i = data.length; i > 2; i --)
	// 		data [i] = data [i - 1];
	// 	data [2] = tmp;
	// }
	return data;
}

// NUMreverseRealFastFourierTransform in Praat
export function ifft(data) {
	// if (data.size > 1) {
	// 	/*
	// 		To be compatible with old behaviour.
	// 	*/
	// 	let tmp = data [2];
	// 	for (let i = 2; i < data.length; i ++)
	// 		data [i] = data [i + 1];
	// 	data [data.size] = tmp;
	// }
	const n = data.length;
    const trigcache = new Float64Array(3 * n);
    const splitcache = new Int32Array(32);
    if (n === 1) return;
    drfti1(n, trigcache, splitcache, n);
	drftb1(n, data, trigcache, splitcache, n);
	return data;
}
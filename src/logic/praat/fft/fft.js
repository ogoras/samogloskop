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
	return data;
}

// NUMreverseRealFastFourierTransform in Praat
export function ifft(data) {
	const n = data.length;
    const trigcache = new Float64Array(3 * n);
    const splitcache = new Int32Array(32);
    if (n === 1) return;
    drfti1(n, trigcache, splitcache, n);
	drftb1(n, data, trigcache, splitcache, n);
	return data;
}
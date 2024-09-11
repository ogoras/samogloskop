import { fft, ifft } from "./fft/fft.js";
import { NUM_interpolate_sinc } from "./num/interpolate_sinc.js";

// Sound_resample in Praat
export function resample(samples, oldSampleRate, newSampleRate, precision = 50) {
    const upfactor = newSampleRate / oldSampleRate;
    if (Math.abs(upfactor - 2) < 1e-6) return upsample(samples);
    if (Math.abs(upfactor - 1) < 1e-6) return samples;
    try {
        const nx = samples.length;
        const duration = nx / oldSampleRate;
        const numberOfSamples = Math.round(duration * newSampleRate);
        if (numberOfSamples < 1) throw new Error("The resampled sound would have no samples.");
        const weNeedAnAntiAliasingFilter = upfactor < 1;
        if (weNeedAnAntiAliasingFilter) {
            const antiTurnAround = 1000;
            const numberOfPanningSides = 2;
            const nfft = iroundUpToPowerOfTwo(nx + antiTurnAround * numberOfPanningSides);
            const data = new Float64Array(nfft);
            const filtered = new Float32Array(nx);
            data.set(samples, antiTurnAround);
            fft(data);    // go to the frequency domain
            for (var i = Math.floor(upfactor * nfft) - 2; i < nfft; i ++) data [i] = 0.0;   // filter away high frequencies
            ifft(data);   // return to the time domain
            var factor = 1.0 / nfft;
            for (var i = 0; i < nx; i ++)
				filtered [i] = data [i + antiTurnAround] * factor;
            samples = filtered;
        }
        const newSamples = new Float32Array(numberOfSamples);
        const old_x1 = 0.5 / oldSampleRate;
        const old_dx = 1 / oldSampleRate;
        const new_x1 = 0.5 / newSampleRate;
        const new_dx = 1 / newSampleRate;
        if (precision <= 1) {
            for (var i = 0; i < numberOfSamples; i++) {
				const x = new_x1 + i * new_dx;
				const index = (x - old_x1) / old_dx;
				const leftSample = Math.floor(index);
				const fraction = index - leftSample;
				newSamples [i] = ( leftSample < 1 || leftSample >= nx ? 0.0 :
						(1 - fraction) * samples [leftSample] + fraction * samples [leftSample + 1] );
            }
        }
        else {
            for (var i = 0; i < numberOfSamples; i ++) {
				const x = new_x1 + i * new_dx;
				const index = (x - old_x1) / old_dx;
				newSamples [i] = NUM_interpolate_sinc (samples, index, precision);
            }
        }
        return newSamples;
    }
    catch {
        throw new Error("Sound not resampled: " + oldSampleRate + " -> " + newSampleRate);
    }
}

// Sound_upsample in Praat
function upsample(samples) {
    // TODO
}

// Melder_iroundUpToPowerOfTwo in Praat
function iroundUpToPowerOfTwo(n) {
    if (n <= 0)
        return 1;
    if (n > 2**32 / 2 + 1) // Javscript only supports bitwise operations on 32-bit integers
        return 0;   // 0 signals overflow; note that signed integer overflow is UB in C++, so this test cannot be removed by relying on n becoming negative
    n -= 1;
    n |= n >> 1;   // copy the highest 1-bit to its right
    n |= n >> 2;   // copy the two highest 1-bits to their right
    n |= n >> 4;   // copy the four highest 1-bits to their right
    n |= n >> 8;   // copy the eight highest 1-bits to their right
    n |= n >> 16;   // copy the 16 highest 1-bits to their right
    n += 1;
    return n;
}
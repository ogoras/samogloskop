// the algorithm based on Praat's Sound_to_Formant_burg
// https://github.com/praat/praat

import { resample } from "./resample.js";

export function soundToFormant(samples, sampleRate, dt, nFormants, maximumFrequency, halfdt_window, preemphasisFrequency) {
    const nyquist = sampleRate / 2;
    if (!(maximumFrequency <= 0.0 || Math.abs(maximumFrequency / nyquist - 1) < 1e-12)) {
        const newSampleRate = maximumFrequency * 2;
        samples = resample(samples, sampleRate, newSampleRate);
        sampleRate = newSampleRate;
    }

}
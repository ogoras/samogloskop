// the algorithm based on Praat's Sound_to_Formant_burg
// https://github.com/praat/praat

import { resample } from "./resample.js";
import { Sound_preEmphasize_inplace } from "./preemphasize.js";

export function soundToFormant(samples, sampleRate, dt = 0, nFormants = 5, maximumFrequency = 5000, halfdt_window = 0.025, preemphasisFrequency = 50) {
    const nyquist = sampleRate / 2;
    if (!(maximumFrequency <= 0.0 || Math.abs(maximumFrequency / nyquist - 1) < 1e-12)) {
        const newSampleRate = maximumFrequency * 2;
        samples = resample(samples, sampleRate, newSampleRate);
        sampleRate = newSampleRate;
    }

    const numberOfPoles = Math.round(nFormants * 2);

    dt = ( dt > 0.0 ? dt : halfdt_window / 4.0 );
    const nx = samples.length;
    const dx = 1.0 / sampleRate;
    const physicalDuration = nx * dx;
    let dt_window = 2.0 * halfdt_window;
    let nFrames = 1 + Math.floor((physicalDuration - dt_window) / dt);
    let nsamp_window = Math.floor(dt_window / dx), halfnsamp_window = nsamp_window / 2;

    if (nsamp_window < numberOfPoles + 1) throw new Error("Window too short.");
    const x1 = 0.5 / sampleRate;
    let t1 = x1 + 0.5 * (physicalDuration - dx - (nFrames - 1) * dt);   // centre of first frame
    if (nFrames < 1) {
        nFrames = 1;
        t1 = x1 + 0.5 * physicalDuration;
        dt_window = physicalDuration;
        nsamp_window = nx;
    }

    //console.log("Formant analysis...");

    Sound_preEmphasize_inplace(samples, dx, preemphasisFrequency);
}
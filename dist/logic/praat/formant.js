// the algorithm based on Praat's Sound_to_Formant_burg
// https://github.com/praat/praat
import resample from "./resample.js";
import Sound_preEmphasize_inplace from "./preemphasize.js";
import burg from "./burg.js";
export default function soundToFormant(samples, sampleRate, maximumFrequency = 5000, dt = 0, nFormants = 5, halfdt_window = 0.05, preemphasisFrequency = 50) {
    const safetyMargin = 50; // set to 0 to keep all formants (expect trash values)
    const nyquist = sampleRate / 2;
    if (!(maximumFrequency <= 0.0 || Math.abs(maximumFrequency / nyquist - 1) < 1e-12)) {
        const newSampleRate = maximumFrequency * 2;
        samples = resample(samples, sampleRate, newSampleRate);
        sampleRate = newSampleRate;
    }
    const numberOfPoles = Math.round(nFormants * 2);
    dt = (dt > 0.0 ? dt : halfdt_window / 4.0);
    const nx = samples.length;
    const dx = 1.0 / sampleRate;
    const physicalDuration = nx * dx;
    let dt_window = 2.0 * halfdt_window;
    let nFrames = 1 + Math.floor((physicalDuration - dt_window) / dt);
    let nsamp_window = Math.floor(dt_window / dx), halfnsamp_window = nsamp_window / 2;
    if (nsamp_window < numberOfPoles + 1)
        throw new Error("Window too short.");
    const x1 = 0.5 / sampleRate;
    let t1 = x1 + 0.5 * (physicalDuration - dx - (nFrames - 1) * dt); // centre of first frame
    if (nFrames < 1) {
        nFrames = 1;
        t1 = x1 + 0.5 * physicalDuration;
        dt_window = physicalDuration;
        nsamp_window = nx;
    }
    /* Pre-emphasis. */
    Sound_preEmphasize_inplace(samples, dx, preemphasisFrequency);
    /* Gaussian window. */
    const window = new Float64Array(nsamp_window);
    for (let i = 0; i < nsamp_window; i++) {
        const imid = 0.5 * (nsamp_window + 1), edge = Math.exp(-12.0);
        window[i] = (Math.exp(-48.0 * (i + 1 - imid) * (i + 1 - imid) / (nsamp_window + 1) / (nsamp_window + 1)) - edge) / (1.0 - edge);
    }
    let maximumFrameLength = nsamp_window;
    const frameBuffer = new Float64Array(maximumFrameLength);
    const coefficients = new Float64Array(numberOfPoles); // superfluous if which==2, but nobody uses that anyway
    const intensities = new Float64Array(nFrames);
    const formantFrames = [];
    for (let iframe = 0; iframe < nFrames; iframe++) {
        const t = t1 + iframe * dt;
        const leftSample = Math.floor((t - x1) / dx);
        const rightSample = leftSample + 1;
        let startSample = rightSample - halfnsamp_window;
        let endSample = leftSample + halfnsamp_window;
        let maximumIntensity = 0.0;
        startSample = Math.max(0, startSample);
        endSample = Math.min(nx - 1, endSample);
        for (let i = startSample; i <= endSample; i++) {
            const value = samples[i];
            if (value * value > maximumIntensity)
                maximumIntensity = value * value;
        }
        intensities[iframe] = maximumIntensity;
        if (maximumIntensity == 0.0)
            continue; // Burg cannot stand all zeroes
        /* Copy a pre-emphasized window to a frame. */
        const actualFrameLength = endSample - startSample + 1; // should rarely be less than nsamp_window
        const offset = startSample;
        for (let isamp = 0; isamp < actualFrameLength; isamp++)
            frameBuffer[isamp] = samples[offset + isamp] * window[isamp];
        const frame = frameBuffer.slice(0, actualFrameLength);
        formantFrames.push(burg(frame, coefficients, maximumIntensity, 0.5 / dx, safetyMargin));
    }
    Formant_sort(formantFrames);
    return formantFrames;
}
function Formant_sort(formantFrames) {
    for (let iframe = 0; iframe < formantFrames.length; iframe++) {
        let frame = formantFrames[iframe];
        let n = frame.numberOfFormants;
        for (let i = 0; i < n - 1; i++) {
            let min = frame.formant[i].frequency;
            let imin = i;
            for (let j = i + 1; j < n; j++)
                if (frame.formant[j].frequency < min) {
                    min = frame.formant[j].frequency;
                    imin = j;
                }
            if (imin != i) {
                const min_bandwidth = frame.formant[imin].bandwidth;
                frame.formant[imin].frequency = frame.formant[i].frequency;
                frame.formant[imin].bandwidth = frame.formant[i].bandwidth;
                frame.formant[i].frequency = min;
                frame.formant[i].bandwidth = min_bandwidth;
            }
        }
    }
}

export default function Sound_preEmphasize_inplace(samples, dx, cutoffFrequency) {
    const NUM2pi = 2 * Math.PI;
    const emphasisFactor = Math.exp (- NUM2pi * cutoffFrequency * dx);
    if (emphasisFactor != 0.0)   // OPTIMIZE; will happen for cut-off frequencies above 119 times the sampling frequency
        for (let i = samples.length - 1; i >= 1; i--) samples [i] -= emphasisFactor * samples [i - 1];
}
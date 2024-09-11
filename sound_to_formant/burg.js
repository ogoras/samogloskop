import { VECburg } from './num/vec_burg.js';

export function burg(samples, coefficients, frame_intensity, nyquistFrequency, safetyMargin) {
    return;
    // TODO
    let frame = {
        numberOfFormants: 0,
        intensity: frame_intensity,
        formant: []
    };
	let a0 = VECburg (coefficients, samples);   // a0 unused for some reason ??
	/*
		Convert LP coefficients to polynomial.
	 */
	let polynomial = Polynomial_create (-1, 1, coefficients.size);
	for (let i = 1; i <= coefficients.size; i ++)
		polynomial.coefficients [i] = - coefficients [coefficients.size - i + 1];
	polynomial.coefficients [coefficients.size + 1] = 1.0;

	/*
		Find the roots of the polynomial.
	 */
	let roots = Polynomial_to_Roots (polynomial);
	Roots_fixIntoUnitCircle (roots);

	/*
		First pass: count the formants.
		The roots come in conjugate pairs, so we need only count those above the real axis.
	 */
	for (let iroot = 1; iroot <= roots.numberOfRoots; iroot ++)
		if (roots.roots [iroot].imag() >= 0.0) {
			const f = Math.abs (Math.atan2 (roots.roots [iroot].imag(), roots.roots [iroot].real())) * nyquistFrequency / NUMpi;
			if (f >= safetyMargin && f <= nyquistFrequency - safetyMargin)
				frame.numberOfFormants ++;
		}

	/*
		Create space for formant data.
	 */
	if (frame.numberOfFormants > 0) frame.formant = Array(frame.numberOfFormants).fill({});

	/*
		Second pass: fill in the formants.
	 */
	let iformant = 0;
	for (let iroot = 1; iroot <= roots.numberOfRoots; iroot ++)
		if (roots.roots [iroot].imag() >= 0.0) {
			const f = Math.abs (Math.atan2 (roots.roots [iroot].imag(), roots.roots [iroot].real())) * nyquistFrequency / NUMpi;
			if (f >= safetyMargin && f <= nyquistFrequency - safetyMargin) {
				let formant = frame.formant [++ iformant];
				formant.frequency = f;
				formant.bandwidth = -
					Math.log (norm (roots.roots [iroot])) * nyquistFrequency / NUMpi;
			}
		}
	if (iformant != frame.numberOfFormants) throw new Eroor("Error in burg: iformant != frame.numberOfFormants");   // may fail if some frequency is NaN
    
    return frame;
}
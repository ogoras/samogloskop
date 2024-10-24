import VECburg from './num/vec_burg.js';
import { Polynomial_create } from './num/polynomial.js';
import { Polynomial_to_Roots, Roots_fixIntoUnitCircle } from './num/roots.js';

export default function burg(samples, coefficients, frame_intensity, nyquistFrequency, safetyMargin) {
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
	let polynomial = Polynomial_create (-1, 1, coefficients.length);
	for (let i = 0; i < coefficients.length; i ++)
		polynomial.coefficients [i] = - coefficients [coefficients.length - i - 1];
	polynomial.coefficients [coefficients.length] = 1.0;

	/*
		Find the roots of the polynomial.
	 */
	let roots = Polynomial_to_Roots (polynomial);
	Roots_fixIntoUnitCircle (roots);

	const NUMpi = Math.PI;
	/*
		First pass: count the formants.
		The roots come in conjugate pairs, so we need only count those above the real axis.
	 */
	for (let iroot = 0; iroot < roots.numberOfRoots; iroot ++)
		if (roots.roots [iroot].im >= 0.0) {
			const f = Math.abs (Math.atan2 (roots.roots [iroot].im, roots.roots [iroot].re)) * nyquistFrequency / NUMpi;
			if (f >= safetyMargin && f <= nyquistFrequency - safetyMargin) frame.numberOfFormants ++;
			//else console.log(iroot, f)
		}

	/*
		Create space for formant data.
	 */
	if (frame.numberOfFormants > 0) frame.formant = Array(frame.numberOfFormants).fill(0).map(() => ({}));

	/*
		Second pass: fill in the formants.
	 */
	let iformant = 0;
	for (let iroot = 0; iroot < roots.numberOfRoots; iroot ++)
		if (roots.roots [iroot].im >= 0.0) {
			const f = Math.abs (Math.atan2 (roots.roots [iroot].im, roots.roots [iroot].re)) * nyquistFrequency / NUMpi;
			if (f >= safetyMargin && f <= nyquistFrequency - safetyMargin) {
				frame.formant[iformant].frequency = f;
				frame.formant[iformant].bandwidth = -Math.log (math.norm (roots.roots [iroot])) * nyquistFrequency / NUMpi;
				iformant ++;
			}
		}
	if (iformant != frame.numberOfFormants) throw new Eroor("Error in burg: iformant != frame.numberOfFormants");   // may fail if some frequency is NaN

    return frame;
}
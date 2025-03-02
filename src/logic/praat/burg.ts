import VECburg from './num/vec_burg.js';
import { Polynomial_create } from './num/polynomial.js';
import { Polynomial_to_Roots, Roots_fixIntoUnitCircle } from './num/roots.js';

import type * as math_node from 'mathjs';
declare const math: typeof math_node;

export default function burg(
	samples: number[],
	coefficients: number[],
	frame_intensity: number,
	nyquistFrequency: number,
	safetyMargin: number
) {
    // TODO
    let frame: {
		numberOfFormants: number,
		intensity: number,
		formant: {
			frequency?: number,
			bandwidth?: number
		}[]
	} = {
        numberOfFormants: 0,
        intensity: frame_intensity,
        formant: []
    }
	let a0 = VECburg (coefficients, samples);   // a0 unused for some reason ??
	/*
		Convert LP coefficients to polynomial.
	 */
	let polynomial = Polynomial_create (-1, 1, coefficients.length);
	for (let i = 0; i < coefficients.length; i ++)
		polynomial.coefficients [i] = - coefficients [coefficients.length - i - 1]!;
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
				frame.formant[iformant]!.frequency = f;
				const norm = math.norm (roots.roots [iroot]);
				if (typeof norm !== "number") throw new Error("Error in burg: typeof norm !== number");
				frame.formant[iformant]!.bandwidth = -Math.log(norm) * nyquistFrequency / NUMpi;
				iformant ++;
			}
		}
	if (iformant != frame.numberOfFormants) throw new Error("Error in burg: iformant != frame.numberOfFormants");   // may fail if some frequency is NaN

    return frame;
}
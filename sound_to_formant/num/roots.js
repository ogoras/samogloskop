//import { dhseqr_ } from "./lapack/dhseqr";
import { Polynomial_evaluateWithDerivative_z, Polynomial_evaluateWithDerivative } from "./polynomial.js";

// Roots.cpp in Praat
export function Polynomial_to_Roots(polynomial) {
    try {
        if (polynomial.numberOfCoefficients != polynomial.coefficients.length) throw new Error("Number of coefficients mismatch!"); // check invariant
        let np1 = polynomial.numberOfCoefficients, n = np1 - 1;
        if (n <= 0) throw new Error ("Cannot find roots of a constant function.");
        /*
            Allocate storage for a special upper Hessenberg matrix (n * n)
            The roots of a polynomial are the eigenvalues of an
            upper Hessenberg matrix with the coefficients of the polynomial.
            See for example the introduction in:
            G.S. Ammar, D. Calvetti, W.B. Gragg, L. Reichel (2001):
            "Polynomial zero finders based on Szegö polynomials.",
            Journal of Computational and Applied Mathematics 127: 1-–16.
        */
        //const wr = new Float64Array(n);
        //const wi = new Float64Array(n);
        const upperHessenberg = Array(n).fill(0).map(() => new Array(n).fill(0));
        // MATVU uh_CM (upperHessenberg.get());
        // uh_CM.rowStride = 1; uh_CM.colStride = n;
    
        upperHessenberg [0] [n-1] = - (polynomial.coefficients [0] / polynomial.coefficients [np1-1]);
        for (let irow = 1; irow < n; irow ++) {
            upperHessenberg [irow] [n-1] = - (polynomial.coefficients [irow] / polynomial.coefficients [np1-1]);
            upperHessenberg [irow] [irow - 1] = 1.0;
        }
        // /*
        //     Find out the working storage needed
        // */
        // let wtmp;
        // let lwork = -1, info;
        // NUMlapack_dhseqr_ ("E", "N", n, 1, n, upperHessenberg, n, wr, wi, null, n, wtmp, lwork, info);
        // lwork = Math.ceil (wtmp);
        // const work = new Float64Array(lwork);
        // /*
        //     Find eigenvalues/roots.
        // */
        // NUMlapack_dhseqr_ ("E", "N", n, 1, n, upperHessenberg, n, wr, wi, null, n, work, lwork, info);
        let eigenvalues;
        try {
            eigenvalues = math.eigs(upperHessenberg).values;
        }
        catch (error) {
            if (!error.values) throw error;
            eigenvalues = error.values;
        }
    
        let numberOfEigenvaluesFound = eigenvalues.length;
        //if (numberOfEigenvaluesFound <= 0) throw new Error("No eigenvalues found.");
        //console.log(numberOfEigenvaluesFound, n)
    
        let thee = {
            numberOfRoots: numberOfEigenvaluesFound,
            roots: new Array(numberOfEigenvaluesFound)
        }
        for (let i = 0; i < numberOfEigenvaluesFound; i ++) {
            thee.roots[i] = eigenvalues[i];
        }
        Roots_Polynomial_polish (thee, polynomial);
        return thee;
    } catch (error) {
        throw new Error(polynomial + ": no roots can be calculated.\nError info: " + error);
    }
}

function Roots_Polynomial_polish (me, thee) {
	const maxit = 80;
	let i = 0;
	while (i < me.numberOfRoots) {
		const im = me.roots[i].im, re = me.roots [i].re;
		if (im != 0.0) {
			Polynomial_polish_complexroot_nr (thee, me.roots, i, maxit);
			if (i < me.numberOfRoots - 1 && im == - me.roots [i + 1].im && re == me.roots [i + 1].re) {
				me.roots [i + 1].re = me.roots [i].re;
				me.roots [i + 1].im = - me.roots [i].im;
				i ++;
			}
		} else {
			me.roots [i].re = Polynomial_polish_realroot (thee, me.roots[i].re, maxit);
		}
		i ++;
	}
}

function Polynomial_polish_complexroot_nr (me, roots, i, maxit) {
	const eps = math.config.absTol;
	let zbest = roots[i];
	let ymin = 1e308;
	for (let iter = 1; iter <= maxit; iter ++) {
		let y, dy;
		({y, dy} = Polynomial_evaluateWithDerivative_z (me, roots[i]));
		const fabsy = math.abs (y);
		if (fabsy > ymin || Math.abs (fabsy - ymin) < eps) {
			/*
				We stop, because the approximation is getting worse.
				Return the previous (hitherto best) value for z.
			*/
			roots[i] = zbest;
			return;
		}
		ymin = fabsy;
		zbest = roots[i];
		if (math.abs (dy) == 0.0)
			return;
		const dz = math.divide(y, dy);   // Newton-Raphson
		roots[i] -= dz;
	}
	// Melder_throw (U"Maximum number of iterations exceeded.");
}

function Polynomial_polish_realroot (me, x, maxit) {
	const eps = math.config.absTol;
	let xbest = x, ymin = 1e308;
	for (let iter = 1; iter <= maxit; iter ++) {
		let y, dy;
		({y, dy} = Polynomial_evaluateWithDerivative (me, x));
		const fabsy = Math.abs (y);
		if (fabsy > ymin || Math.abs (fabsy - ymin) < eps) {
			/*
				We stop, because the approximation is getting worse or we cannot get any closer.
				Return the previous (hitherto best) value for x.
			*/
			x = xbest;
			return x;
		}
		ymin = fabsy;
		xbest = x;
		if (Math.abs (dy) == 0.0)
			return x;
		const dx = y / dy;   // Newton-Raphson
		x -= dx;
	}
	return x;
	// Melder_throw (U"Maximum number of iterations exceeded.");
}

export function Roots_fixIntoUnitCircle (me) {
    let z10 = { re: 1.0, im: 0.0 };
    for (let iroot = 0; iroot < me.numberOfRoots; iroot ++)
        if (math.abs (me.roots[iroot]) > 1.0)
            me.roots [iroot] = math.divide(z10, math.conj (me.roots [iroot]));
}
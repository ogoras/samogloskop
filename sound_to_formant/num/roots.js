// Roots.cpp in Praat
export function Polynomial_to_Roots(polynomial) {
    try {
        if (polynomial.numberOfCoefficients != polynomial.coefficients.size) throw new Error("Number of coefficients mismatch!"); // check invariant
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
        const wr = new Float64Array(n);
        const wi = new Float64Array(n);
        const upperHessenberg = Array(n).fill(0).map(() => new Float64Array(n));
        // MATVU uh_CM (upperHessenberg.get());
        // uh_CM.rowStride = 1; uh_CM.colStride = n;
    
        upperHessenberg [0] [n-1] = - (polynomial.coefficients [0] / polynomial.coefficients [np1-1]);
        for (let irow = 1; irow < n; irow ++) {
            uh_CM [irow] [n-1] = - (polynomial.coefficients [irow] / polynomial.coefficients [np1-1]);
            uh_CM [irow] [irow - 1] = 1.0;
        }
        /*
            Find out the working storage needed
        */
        let wtmp;
        let lwork = -1, info;
        NUMlapack_dhseqr_ ("E", "N", n, 1, n, upperHessenberg, n, wr, wi, null, n, wtmp, lwork, info);
        lwork = Math.ceil (wtmp);
        const work = new Float64Array(lwork);
        /*
            Find eigenvalues/roots.
        */
        NUMlapack_dhseqr_ ("E", "N", n, 1, n, upperHessenberg, n, wr, wi, null, n, work, lwork, info);
    
        let numberOfEigenvaluesFound = n, ioffset = 0;
        if (info > 0) {
            /*
                if INFO = i, NUMlapack_dhseqr_ failed to compute all of the eigenvalues. Elements i+1:n of
            WR and WI contain those eigenvalues which have been successfully computed
            */
            numberOfEigenvaluesFound -= info;
            if (numberOfEigenvaluesFound <= 0) throw new Error("No eigenvalues found.");
            ioffset = info;
        } else if (info < 0) {
            throw new Error ("NUMlapack_dhseqr_ returns error " + info + ".");
        }
    
        let thee = Roots_create (numberOfEigenvaluesFound);
        for (let i = 0; i < numberOfEigenvaluesFound; i ++) {
            thee.roots [i]. real (wr [ioffset + i]);
            thee.roots [i]. imag (wi [ioffset + i]);
        }
        Roots_Polynomial_polish (thee, polynomial);
        return thee;
    } catch (error) {
        throw new Error(polynomial + ": no roots can be calculated.\nError info: " + error);
    }
}
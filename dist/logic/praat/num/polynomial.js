// Polynomial.cpp in Praat
export function Polynomial_create(xmin, xmax, degree) {
    return {
        xmin: xmin,
        xmax: xmax,
        coefficients: new Float64Array(degree + 1),
        numberOfCoefficients: degree + 1,
        _capacity: degree + 1
    };
}
export function Polynomial_evaluateWithDerivative_z(me, in_z) {
    let pr = me.coefficients[me.numberOfCoefficients - 1], pi = 0.0;
    let dpr = 0.0, dpi = 0.0, x = in_z.re, y = in_z.im;
    for (let i = me.numberOfCoefficients - 2; i >= 0; i--) {
        let tr = dpr;
        dpr = dpr * x - dpi * y + pr;
        dpi = tr * y + dpi * x + pi;
        tr = pr;
        pr = pr * x - pi * y + me.coefficients[i];
        pi = tr * y + pi * x;
    }
    return {
        y: math.complex(pr, pi),
        dy: math.complex(dpr, dpi)
    };
}
export function Polynomial_evaluateWithDerivative(me, x) {
    let p = me.coefficients[me.numberOfCoefficients - 1], dp = 0.0;
    for (let i = me.numberOfCoefficients - 2; i >= 0; i--) {
        dp = dp * x + p;
        p = p * x + me.coefficients[i];
    }
    return { y: p, dy: dp };
}

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
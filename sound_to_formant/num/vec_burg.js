// NUM2.cpp in Praat
export function VECburg(a, x) {
    const n = x.length, m = a.length;
	a.fill(0);
	if (n <= 2) {
		a [0] = -1.0;
		return ( n == 2 ? 0.5 * (x [0] * x [0] + x [1] * x [1]) : x [0] * x [0] );
	}

	let b1 = new Float64Array(n), b2 = new Float64Array(n), aa = new Float64Array(m);

	// (3)

	let p = 0.0;
	for (let j = 0; j < n; j ++)
		p += x [j] * x [j];

	let xms = p / n;
	if (xms <= 0.0)
		return xms;	// warning empty

	// (9)

	b1 [0] = x [0];
	if (n < 2)
		return xms;
	b2 [n - 2] = x [n - 1];
	for (let j = 1; j < n - 1; j ++)
		b1 [j] = b2 [j - 1] = x [j];

	for (let i = 0; i < m; i ++) {
		// (7)

		let num = 0.0, denum = 0.0;
		for (let j = 0; j < n - i; j ++) {
			num += b1 [j] * b2 [j];
			denum += b1 [j] * b1 [j] + b2 [j] * b2 [j];
		}

		if (denum <= 0.0) return 0.0;	// warning ill-conditioned

		a [i] = 2.0 * num / denum;

		// (10)

		xms *= 1.0 - a [i] * a [i];

		// (5)

		for (let j = 0; j <= i - 1; j ++)
			a [j] = aa [j] - a [i] * aa [i - j];

		if (i < m - 1) {

			// (8) Watch out: i -> i+1

			for (let j = 0; j <= i; j ++)
				aa [j] = a [j];
			for (let j = 0; j < n - i - 1; j ++) {
				b1 [j] -= aa [i] * b2 [j];
				b2 [j] = b2 [j + 1] - aa [i] * b1 [j + 1];
			}
		}
	}
	return xms;
}
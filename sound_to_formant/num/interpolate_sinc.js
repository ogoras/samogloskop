export function NUM_interpolate_sinc (y, x, maxDepth) {
	const midleft = Math.floor (x), midright = midleft + 1;
	var result = 0.0;
	if (y.length < 1)
		return undefined;   // there exists no best guess
	if (x < 1)
		return y [1];   // offleft: constant extrapolation
	if (x > y.size)
		return y [y.size];   // offright: constant extrapolation
	if (x == midleft)
		return y [midleft];   // the interpolated curve goes through the points
	/*
		1 < x < y.size && x not var: interpolate.
	*/
	maxDepth = Math.min(maxDepth, midright - 1, y.size - midleft);
	if (maxDepth <= 0)  // nearest
		return y [Math.floor (x + 0.5)];
	if (maxDepth == 1)  // linear
		return y [midleft] + (x - midleft) * (y [midright] - y [midleft]);
	if (maxDepth == 2) { // cubic
		const yl = y [midleft], yr = y [midright];
		const dyl = 0.5 * (yr - y [midleft - 1]), dyr = 0.5 * (y [midright + 1] - yl);
		const fil = x - midleft, fir = midright - x;
		return yl * fir + yr * fil - fil * fir * (0.5 * (dyr - dyl) + (fil - 0.5) * (dyl + dyr - 2 * (yr - yl)));
	}
	/*
		maxDepth >= 3: sinc interpolation
	*/
	const left = midright - maxDepth;
	const right = midleft + maxDepth;
	var a = NUMpi * (x - midleft);
	var halfsina = 0.5 * sin (a);
	var aa = a / (x - left + 1.0);
	var daa = NUMpi / (x - left + 1.0);

    var cosaa = cos (aa);
    var sinaa = sin (aa);
    var cosdaa = cos (daa);
    var sindaa = sin (daa);

	for (var ix = midleft; ix >= left; ix --) {

		const d = halfsina / a * (1.0 + cosaa);

		result += y [ix] * d;
		a += NUMpi;

        const help = cosaa * cosdaa - sinaa * sindaa;
        sinaa = cosaa * sindaa + sinaa * cosdaa;
        cosaa = help;

		halfsina = - halfsina;
	}
	a = NUMpi * (midright - x);
	halfsina = 0.5 * sin (a);
	aa = a / (right - x + 1.0);
	daa = NUMpi / (right - x + 1.0);

    cosaa = cos (aa);
    sinaa = sin (aa);
    cosdaa = cos (daa);
    sindaa = sin (daa);

	for (var ix = midright; ix <= right; ix ++) {
		const d = halfsina / a * (1.0 + cosaa);
		result += y [ix] * d;
		a += NUMpi;

        const help = cosaa * cosdaa - sinaa * sindaa;
        sinaa = cosaa * sindaa + sinaa * cosdaa;
        cosaa = help;

		halfsina = - halfsina;
	}
	return result;
}
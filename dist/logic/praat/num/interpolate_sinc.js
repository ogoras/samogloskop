export default function NUM_interpolate_sinc(y, x, maxDepth) {
    const NUMpi = Math.PI;
    const midleft = Math.floor(x), midright = midleft + 1;
    let result = 0.0;
    if (y.length < 1)
        return undefined; // there exists no best guess
    if (x < 0)
        return y[0]; // offleft: constant extrapolation
    if (x > y.length - 1)
        return y[y.length - 1]; // offright: constant extrapolation
    if (x == midleft)
        return y[midleft]; // the interpolated curve goes through the points
    /*
        1 < x < y.length && x not let: interpolate.
    */
    maxDepth = Math.min(maxDepth, midright, y.length - midleft - 1);
    if (maxDepth <= 0) // nearest
        return y[Math.floor(x + 0.5)];
    if (maxDepth == 1) // linear
        return y[midleft] + (x - midleft) * (y[midright] - y[midleft]);
    if (maxDepth == 2) { // cubic
        const yl = y[midleft], yr = y[midright];
        const dyl = 0.5 * (yr - y[midleft - 1]), dyr = 0.5 * (y[midright + 1] - yl);
        const fil = x - midleft, fir = midright - x;
        return yl * fir + yr * fil - fil * fir * (0.5 * (dyr - dyl) + (fil - 0.5) * (dyl + dyr - 2 * (yr - yl)));
    }
    /*
        maxDepth >= 3: sinc interpolation
    */
    const left = midright - maxDepth;
    const right = midleft + maxDepth;
    let a = NUMpi * (x - midleft);
    let halfsina = 0.5 * Math.sin(a);
    let aa = a / (x - left + 1.0);
    let daa = NUMpi / (x - left + 1.0);
    let cosaa = Math.cos(aa);
    let sinaa = Math.sin(aa);
    let cosdaa = Math.cos(daa);
    let sindaa = Math.sin(daa);
    for (let ix = midleft; ix >= left; ix--) {
        const d = halfsina / a * (1.0 + cosaa);
        result += y[ix] * d;
        a += NUMpi;
        const help = cosaa * cosdaa - sinaa * sindaa;
        sinaa = cosaa * sindaa + sinaa * cosdaa;
        cosaa = help;
        halfsina = -halfsina;
    }
    a = NUMpi * (midright - x);
    halfsina = 0.5 * Math.sin(a);
    aa = a / (right - x + 1.0);
    daa = NUMpi / (right - x + 1.0);
    cosaa = Math.cos(aa);
    sinaa = Math.sin(aa);
    cosdaa = Math.cos(daa);
    sindaa = Math.sin(daa);
    for (let ix = midright; ix <= right; ix++) {
        const d = halfsina / a * (1.0 + cosaa);
        result += y[ix] * d;
        a += NUMpi;
        const help = cosaa * cosdaa - sinaa * sindaa;
        sinaa = cosaa * sindaa + sinaa * cosdaa;
        cosaa = help;
        halfsina = -halfsina;
    }
    return result;
}

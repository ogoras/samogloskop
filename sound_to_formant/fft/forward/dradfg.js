// NUMfft_core.h in Praat
export function dradfg (ido, ip, l1, idl1, cc, c1, c2, ch, ch2, wa, waoffset)
{
	const tpi = 6.28318530717958647692528676655900577;
	var is;
	var t1, t2, t3, t4, t5, t6, t7, t8, t9;

	const arg = tpi / ip;
	const dcp = Math.cos (arg);
	const dsp = Math.sin (arg);
	const ipph = (ip + 1) >> 1;
	const ipp2 = ip;
	const idp2 = ido;
	const nbd = (ido - 1) >> 1;
	const t0 = l1 * ido;
	const t10 = ip * ido;

	if (ido == 1)
		return L119();
	for (var ik = 0; ik < idl1; ik++)
		ch2 [ik] = c2 [ik];

	t1 = 0;
	for (var j = 1; j < ip; j++)
	{
		t1 += t0;
		t2 = t1;
		for (var k = 0; k < l1; k++)
		{
			ch [t2] = c1 [t2];
			t2 += ido;
		}
	}

	is = -ido;
	t1 = 0;
	if (nbd > l1)
	{
		for (var j = 1; j < ip; j++)
		{
			t1 += t0;
			is += ido;
			t2 = -ido + t1;
			for (var k = 0; k < l1; k++)
			{
				var idij = is - 1;
				t2 += ido;
				t3 = t2;
				for (var i = 2; i < ido; i += 2)
				{
					idij += 2;
					t3 += 2;
					ch [t3 - 1] = wa [waoffset + idij - 1] * c1 [t3 - 1] + wa [waoffset + idij] * c1 [t3];
					ch [t3] = wa [waoffset + idij - 1] * c1 [t3] - wa [waoffset + idij] * c1 [t3 - 1];
				}
			}
		}
	}
	else
	{

		for (var j = 1; j < ip; j++)
		{
			is += ido;
			var idij = is - 1;
			t1 += t0;
			t2 = t1;
			for (var i = 2; i < ido; i += 2)
			{
				idij += 2;
				t2 += 2;
				t3 = t2;
				for (var k = 0; k < l1; k++)
				{
					ch [t3 - 1] = wa [waoffset + idij - 1] * c1 [t3 - 1] + wa [waoffset + idij] * c1 [t3];
					ch [t3] = wa [waoffset + idij - 1] * c1 [t3] - wa [waoffset + idij] * c1 [t3 - 1];
					t3 += ido;
				}
			}
		}
	}

	t1 = 0;
	t2 = ipp2 * t0;
	if (nbd < l1)
	{
		for (var j = 1; j < ipph; j++)
		{
			t1 += t0;
			t2 -= t0;
			t3 = t1;
			t4 = t2;
			for (var i = 2; i < ido; i += 2)
			{
				t3 += 2;
				t4 += 2;
				t5 = t3 - ido;
				t6 = t4 - ido;
				for (var k = 0; k < l1; k++)
				{
					t5 += ido;
					t6 += ido;
					c1 [t5 - 1] = ch [t5 - 1] + ch [t6 - 1];
					c1 [t6 - 1] = ch [t5] - ch [t6];
					c1 [t5] = ch [t5] + ch [t6];
					c1 [t6] = ch [t6 - 1] - ch [t5 - 1];
				}
			}
		}
	}
	else
	{
		for (var j = 1; j < ipph; j++)
		{
			t1 += t0;
			t2 -= t0;
			t3 = t1;
			t4 = t2;
			for (var k = 0; k < l1; k++)
			{
				t5 = t3;
				t6 = t4;
				for (var i = 2; i < ido; i += 2)
				{
					t5 += 2;
					t6 += 2;
					c1 [t5 - 1] = ch [t5 - 1] + ch [t6 - 1];
					c1 [t6 - 1] = ch [t5] - ch [t6];
					c1 [t5] = ch [t5] + ch [t6];
					c1 [t6] = ch [t6 - 1] - ch [t5 - 1];
				}
				t3 += ido;
				t4 += ido;
			}
		}
	}

    function L119() {
        for (var ik = 0; ik < idl1; ik++)
            c2 [ik] = ch2 [ik];

        t1 = 0;
        t2 = ipp2 * idl1;
        for (var j = 1; j < ipph; j++)
        {
            t1 += t0;
            t2 -= t0;
            t3 = t1 - ido;
            t4 = t2 - ido;
            for (var k = 0; k < l1; k++)
            {
                t3 += ido;
                t4 += ido;
                c1 [t3] = ch [t3] + ch [t4];
                c1 [t4] = ch [t4] - ch [t3];
            }
        }

        var ar1 = 1.;
        var ai1 = 0.;
        t1 = 0;
        t2 = ipp2 * idl1;
        t3 = (ip - 1) * idl1;
        for (var l = 1; l < ipph; l++)
        {
            t1 += idl1;
            t2 -= idl1;
            const ar1h = dcp * ar1 - dsp * ai1;
            ai1 = dcp * ai1 + dsp * ar1;
            ar1 = ar1h;
            t4 = t1;
            t5 = t2;
            t6 = t3;
            t7 = idl1;

            for (var ik = 0; ik < idl1; ik++)
            {
                ch2 [t4++] = c2 [ik] + ar1 * c2 [t7++];
                ch2 [t5++] = ai1 * c2 [t6++];
            }

            const dc2 = ar1;
            const ds2 = ai1;
            var ar2 = ar1;
            var ai2 = ai1;

            t4 = idl1;
            t5 = (ipp2 - 1) * idl1;
            for (var j = 2; j < ipph; j++)
            {
                t4 += idl1;
                t5 -= idl1;

                const ar2h = dc2 * ar2 - ds2 * ai2;
                ai2 = dc2 * ai2 + ds2 * ar2;
                ar2 = ar2h;

                t6 = t1;
                t7 = t2;
                t8 = t4;
                t9 = t5;
                for (var ik = 0; ik < idl1; ik++)
                {
                    ch2 [t6++] += ar2 * c2 [t8++];
                    ch2 [t7++] += ai2 * c2 [t9++];
                }
            }
        }

        t1 = 0;
        for (var j = 1; j < ipph; j++)
        {
            t1 += idl1;
            t2 = t1;
            for (var ik = 0; ik < idl1; ik++)
                ch2 [ik] += c2 [t2++];
        }

        if (ido < l1)
            return L132();

        t1 = 0;
        t2 = 0;
        for (var k = 0; k < l1; k++)
        {
            t3 = t1;
            t4 = t2;
            for (var i = 0; i < ido; i++)
                cc [t4++] = ch [t3++];
            t1 += ido;
            t2 += t10;
        }

        return L135();
    }

    function L132() {
        for (var i = 0; i < ido; i++)
        {
            t1 = i;
            t2 = i;
            for (var k = 0; k < l1; k++)
            {
                cc [t2] = ch [t1];
                t1 += ido;
                t2 += t10;
            }
        }
        return L135();
    }

    function L135() {
        t1 = 0;
        t2 = ido << 1;
        t3 = 0;
        t4 = ipp2 * t0;
        for (var j = 1; j < ipph; j++)
        {

            t1 += t2;
            t3 += t0;
            t4 -= t0;

            t5 = t1;
            t6 = t3;
            t7 = t4;

            for (var k = 0; k < l1; k++)
            {
                cc [t5 - 1] = ch [t6];
                cc [t5] = ch [t7];
                t5 += t10;
                t6 += ido;
                t7 += ido;
            }
        }

        if (ido == 1)
            return;
        if (nbd < l1)
            return L141();

        t1 = -ido;
        t3 = 0;
        t4 = 0;
        t5 = ipp2 * t0;
        for (var j = 1; j < ipph; j++)
        {
            t1 += t2;
            t3 += t2;
            t4 += t0;
            t5 -= t0;
            t6 = t1;
            t7 = t3;
            t8 = t4;
            t9 = t5;
            for (var k = 0; k < l1; k++)
            {
                for (var i = 2; i < ido; i += 2)
                {
                    const ic = idp2 - i;
                    cc [i + t7 - 1] = ch [i + t8 - 1] + ch [i + t9 - 1];
                    cc [ic + t6 - 1] = ch [i + t8 - 1] - ch [i + t9 - 1];
                    cc [i + t7] = ch [i + t8] + ch [i + t9];
                    cc [ic + t6] = ch [i + t9] - ch [i + t8];
                }
                t6 += t10;
                t7 += t10;
                t8 += ido;
                t9 += ido;
            }
        }
        return;
    }

    function L141() {
        t1 = -ido;
        t3 = 0;
        t4 = 0;
        t5 = ipp2 * t0;
        for (var j = 1; j < ipph; j++)
        {
            t1 += t2;
            t3 += t2;
            t4 += t0;
            t5 -= t0;
            for (var i = 2; i < ido; i += 2)
            {
                t6 = idp2 + t1 - i;
                t7 = i + t3;
                t8 = i + t4;
                t9 = i + t5;
                for (var k = 0; k < l1; k++)
                {
                    cc [t7 - 1] = ch [t8 - 1] + ch [t9 - 1];
                    cc [t6 - 1] = ch [t8 - 1] - ch [t9 - 1];
                    cc [t7] = ch [t8] + ch [t9];
                    cc [t6] = ch [t9] - ch [t8];
                    t6 += t10;
                    t7 += t10;
                    t8 += ido;
                    t9 += ido;
                }
            }
        }
    }
}
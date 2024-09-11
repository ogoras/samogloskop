// NUMfft_core.h in Praat
export function dradbg (ido, ip, l1, idl1, cc, c1, c2, ch, ch2, wa, waoffset)
{
	const tpi = 6.28318530717958647692528676655900577;
	let is, t1, t2, t3, t4, t5, t6, t7, t8, t9, t11, t12;

	const t10 = ip * ido;
	const t0 = l1 * ido;
	const arg = tpi / ip;
	const dcp = Math.cos (arg);
	const dsp = Math.sin (arg);
	const nbd = (ido - 1) >> 1;
	const ipp2 = ip;
	const ipph = (ip + 1) >> 1;
	if (ido < l1)
		return L103();

	t1 = 0;
	t2 = 0;
	for (let k = 0; k < l1; k++)
	{
		t3 = t1;
		t4 = t2;
		for (let i = 0; i < ido; i++)
		{
			ch [t3] = cc [t4];
			t3++;
			t4++;
		}
		t1 += ido;
		t2 += t10;
	}
	return L106();

    function L103() {
        t1 = 0;
        for (let i = 0; i < ido; i++)
        {
            t2 = t1;
            t3 = t1;
            for (let k = 0; k < l1; k++)
            {
                ch [t2] = cc [t3];
                t2 += ido;
                t3 += t10;
            }
            t1++;
        }
    }

    function L106() {
        t1 = 0;
        t2 = ipp2 * t0;
        t7 = (t5 = ido << 1);
        for (let j = 1; j < ipph; j++)
        {
            t1 += t0;
            t2 -= t0;
            t3 = t1;
            t4 = t2;
            t6 = t5;
            for (let k = 0; k < l1; k++)
            {
                ch [t3] = cc [t6 - 1] + cc [t6 - 1];
                ch [t4] = cc [t6] + cc [t6];
                t3 += ido;
                t4 += ido;
                t6 += t10;
            }
            t5 += t7;
        }

        if (ido == 1)
            return L116();
        if (nbd < l1)
            return L112();

        t1 = 0;
        t2 = ipp2 * t0;
        t7 = 0;
        for (let j = 1; j < ipph; j++)
        {
            t1 += t0;
            t2 -= t0;
            t3 = t1;
            t4 = t2;

            t7 += (ido << 1);
            t8 = t7;
            for (let k = 0; k < l1; k++)
            {
                t5 = t3;
                t6 = t4;
                t9 = t8;
                t11 = t8;
                for (let i = 2; i < ido; i += 2)
                {
                    t5 += 2;
                    t6 += 2;
                    t9 += 2;
                    t11 -= 2;
                    ch [t5 - 1] = cc [t9 - 1] + cc [t11 - 1];
                    ch [t6 - 1] = cc [t9 - 1] - cc [t11 - 1];
                    ch [t5] = cc [t9] - cc [t11];
                    ch [t6] = cc [t9] + cc [t11];
                }
                t3 += ido;
                t4 += ido;
                t8 += t10;
            }
        }
        return L116();
    }
    function L112() {
        t1 = 0;
        t2 = ipp2 * t0;
        t7 = 0;
        for (let j = 1; j < ipph; j++)
        {
            t1 += t0;
            t2 -= t0;
            t3 = t1;
            t4 = t2;
            t7 += (ido << 1);
            t8 = t7;
            t9 = t7;
            for (let i = 2; i < ido; i += 2)
            {
                t3 += 2;
                t4 += 2;
                t8 += 2;
                t9 -= 2;
                t5 = t3;
                t6 = t4;
                t11 = t8;
                t12 = t9;
                for (let k = 0; k < l1; k++)
                {
                    ch [t5 - 1] = cc [t11 - 1] + cc [t12 - 1];
                    ch [t6 - 1] = cc [t11 - 1] - cc [t12 - 1];
                    ch [t5] = cc [t11] - cc [t12];
                    ch [t6] = cc [t11] + cc [t12];
                    t5 += ido;
                    t6 += ido;
                    t11 += t10;
                    t12 += t10;
                }
            }
        }
    }
    function L116() {
        let ar1 = 1.;
        let ai1 = 0.;
        t1 = 0;
        t9 = (t2 = ipp2 * idl1);
        t3 = (ip - 1) * idl1;
        for (let l = 1; l < ipph; l++)
        {
            t1 += idl1;
            t2 -= idl1;

            const ar1h = dcp * ar1 - dsp * ai1;
            ai1 = dcp * ai1 + dsp * ar1;
            ar1 = ar1h;
            t4 = t1;
            t5 = t2;
            t6 = 0;
            t7 = idl1;
            t8 = t3;
            for (let ik = 0; ik < idl1; ik++)
            {
                c2 [t4++] = ch2 [t6++] + ar1 * ch2 [t7++];
                c2 [t5++] = ai1 * ch2 [t8++];
            }
            const dc2 = ar1;
            const ds2 = ai1;
            let ar2 = ar1;
            let ai2 = ai1;

            t6 = idl1;
            t7 = t9 - idl1;
            for (let j = 2; j < ipph; j++)
            {
                t6 += idl1;
                t7 -= idl1;
                const ar2h = dc2 * ar2 - ds2 * ai2;
                ai2 = dc2 * ai2 + ds2 * ar2;
                ar2 = ar2h;
                t4 = t1;
                t5 = t2;
                t11 = t6;
                t12 = t7;
                for (let ik = 0; ik < idl1; ik++)
                {
                    c2 [t4++] += ar2 * ch2 [t11++];
                    c2 [t5++] += ai2 * ch2 [t12++];
                }
            }
        }

        t1 = 0;
        for (let j = 1; j < ipph; j++)
        {
            t1 += idl1;
            t2 = t1;
            for (let ik = 0; ik < idl1; ik++)
                ch2 [ik] += ch2 [t2++];
        }

        t1 = 0;
        t2 = ipp2 * t0;
        for (let j = 1; j < ipph; j++)
        {
            t1 += t0;
            t2 -= t0;
            t3 = t1;
            t4 = t2;
            for (let k = 0; k < l1; k++)
            {
                ch [t3] = c1 [t3] - c1 [t4];
                ch [t4] = c1 [t3] + c1 [t4];
                t3 += ido;
                t4 += ido;
            }
        }

        if (ido == 1)
            return L132();
        if (nbd < l1)
            return L128();

        t1 = 0;
        t2 = ipp2 * t0;
        for (let j = 1; j < ipph; j++)
        {
            t1 += t0;
            t2 -= t0;
            t3 = t1;
            t4 = t2;
            for (let k = 0; k < l1; k++)
            {
                t5 = t3;
                t6 = t4;
                for (let i = 2; i < ido; i += 2)
                {
                    t5 += 2;
                    t6 += 2;
                    ch [t5 - 1] = c1 [t5 - 1] - c1 [t6];
                    ch [t6 - 1] = c1 [t5 - 1] + c1 [t6];
                    ch [t5] = c1 [t5] + c1 [t6 - 1];
                    ch [t6] = c1 [t5] - c1 [t6 - 1];
                }
                t3 += ido;
                t4 += ido;
            }
        }
        return L132();
    }
    function L128() {
        t1 = 0;
        t2 = ipp2 * t0;
        for (let j = 1; j < ipph; j++)
        {
            t1 += t0;
            t2 -= t0;
            t3 = t1;
            t4 = t2;
            for (let i = 2; i < ido; i += 2)
            {
                t3 += 2;
                t4 += 2;
                t5 = t3;
                t6 = t4;
                for (let k = 0; k < l1; k++)
                {
                    ch [t5 - 1] = c1 [t5 - 1] - c1 [t6];
                    ch [t6 - 1] = c1 [t5 - 1] + c1 [t6];
                    ch [t5] = c1 [t5] + c1 [t6 - 1];
                    ch [t6] = c1 [t5] - c1 [t6 - 1];
                    t5 += ido;
                    t6 += ido;
                }
            }
        }
    }
    function L132() {
        if (ido == 1)
            return;

        for (let ik = 0; ik < idl1; ik++)
            c2 [ik] = ch2 [ik];

        t1 = 0;
        for (let j = 1; j < ip; j++)
        {
            t2 = (t1 += t0);
            for (let k = 0; k < l1; k++)
            {
                c1 [t2] = ch [t2];
                t2 += ido;
            }
        }

        if (nbd > l1)
            return L139();

        is = -ido - 1;
        t1 = 0;
        for (let j = 1; j < ip; j++)
        {
            is += ido;
            t1 += t0;
            let idij = is;
            t2 = t1;
            for (let i = 2; i < ido; i += 2)
            {
                t2 += 2;
                idij += 2;
                t3 = t2;
                for (let k = 0; k < l1; k++)
                {
                    c1 [t3 - 1] = wa [waoffset + idij - 1] * ch [t3 - 1] - wa [waoffset + idij] * ch [t3];
                    c1 [t3] = wa [waoffset + idij - 1] * ch [t3] + wa [waoffset + idij] * ch [t3 - 1];
                    t3 += ido;
                }
            }
        }
        return;
    }
    function L139() {
        is = -ido - 1;
        t1 = 0;
        for (let j = 1; j < ip; j++)
        {
            is += ido;
            t1 += t0;
            t2 = t1;
            for (let k = 0; k < l1; k++)
            {
                let idij = is;
                t3 = t2;
                for (let i = 2; i < ido; i += 2)
                {
                    idij += 2;
                    t3 += 2;
                    c1 [t3 - 1] = wa [waoffset + idij - 1] * ch [t3 - 1] - wa [waoffset + idij] * ch [t3];
                    c1 [t3] = wa [waoffset + idij - 1] * ch [t3] + wa [waoffset + idij] * ch [t3 - 1];
                }
                t2 += ido;
            }
        }
    }
}
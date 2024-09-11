// something is wrong with this function... TO BE DEBUGGED

export function dradf4 (ido, l1, cc, ch, wa, wa1offset, wa2offset, wa3offset)
{
	const hsqt2 = .70710678118654752440084436210485;
	let t5, t6;

	let t0 = l1 * ido;

	let t1 = t0;
	let t4 = t1 << 1;
	let t2 = t1 + (t1 << 1);
	let t3 = 0;

	for (let k = 0; k < l1; k++)
	{
		const tr1 = cc [t1] + cc [t2];
		const tr2 = cc [t3] + cc [t4];
		ch [t5 = t3 << 2] = tr1 + tr2;
		ch [(ido << 2) + t5 - 1] = tr2 - tr1;
		ch [(t5 += (ido << 1)) - 1] = cc [t3] - cc [t4];
		ch [t5] = cc [t2] - cc [t1];

		t1 += ido;
		t2 += ido;
		t3 += ido;
		t4 += ido;
	}

	if (ido < 2)
		return;
	if (ido == 2)
		return L105();

	t1 = 0;
	for (let k = 0; k < l1; k++)
	{
		t2 = t1;
		t4 = t1 << 2;
		t5 = (t6 = ido << 1) + t4;
		for (let i = 2; i < ido; i += 2)
		{
			t3 = (t2 += 2);
			t4 += 2;
			t5 -= 2;

			t3 += t0;
			const cr2 = wa [ wa1offset + i - 2] * cc [t3 - 1] + wa [ wa1offset + i - 1] * cc [t3];
			const ci2 = wa [ wa1offset + i - 2] * cc [t3] - wa [ wa1offset + i - 1] * cc [t3 - 1];
			t3 += t0;
			const cr3 = wa [ wa2offset + i - 2] * cc [t3 - 1] + wa [ wa2offset + i - 1] * cc [t3];
			const ci3 = wa [ wa2offset + i - 2] * cc [t3] - wa [ wa2offset + i - 1] * cc [t3 - 1];
			t3 += t0;
			const cr4 = wa [ wa3offset + i - 2] * cc [t3 - 1] + wa [ wa3offset + i - 1] * cc [t3];
			const ci4 = wa [ wa3offset + i - 2] * cc [t3] - wa [ wa3offset + i - 1] * cc [t3 - 1];

			const tr1 = cr2 + cr4;
			const tr4 = cr4 - cr2;
			const ti1 = ci2 + ci4;
			const ti4 = ci2 - ci4;
			const ti2 = cc [t2] + ci3;
			const ti3 = cc [t2] - ci3;
			const tr2 = cc [t2 - 1] + cr3;
			const tr3 = cc [t2 - 1] - cr3;

			ch [t4 - 1] = tr1 + tr2;
			ch [t4] = ti1 + ti2;

			ch [t5 - 1] = tr3 - ti4;
			ch [t5] = tr4 - ti3;

			ch [t4 + t6 - 1] = ti4 + tr3;
			ch [t4 + t6] = tr4 + ti3;

			ch [t5 + t6 - 1] = tr2 - tr1;
			ch [t5 + t6] = ti1 - ti2;
		}
		t1 += ido;
	}
	if (ido % 2 == 1)
		return;
	L105();


    function L105() {
        t2 = (t1 = t0 + ido - 1) + (t0 << 1);
        t3 = ido << 2;
        t4 = ido;
        t5 = ido << 1;
        t6 = ido;

        for (let k = 0; k < l1; k++)
        {
            const ti1 = -hsqt2 * (cc [t1] + cc [t2]);
            const tr1 = hsqt2 * (cc [t1] - cc [t2]);
            ch [t4 - 1] = tr1 + cc [t6 - 1];
            ch [t4 + t5 - 1] = cc [t6 - 1] - tr1;
            ch [t4] = ti1 - cc [t1 + t0];
            ch [t4 + t5] = ti1 + cc [t1 + t0];
            t1 += ido;
            t2 += ido;
            t4 += t3;
            t6 += ido;
        }
    }
}
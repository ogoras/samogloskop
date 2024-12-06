export default function dradb4 (ido, l1, cc, ch, wa, wa1offset, wa2offset, wa3offset)
{
	const sqrt2 = 1.4142135623730950488016887242097;

	const t0 = l1 * ido;

	let t1 = 0;
	let t2 = ido << 2;
	let t3 = 0, t4, t5, t8;
	const t6 = ido << 1;
	for (let k = 0; k < l1; k++)
	{
		t4 = t3 + t6;
		t5 = t1;
		const tr3 = cc [t4 - 1] + cc [t4 - 1];
		const tr4 = cc [t4] + cc [t4];
		const tr1 = cc [t3] - cc [(t4 += t6) - 1];
		const tr2 = cc [t3] + cc [t4 - 1];
		ch [t5] = tr2 + tr3;
		ch [t5 += t0] = tr1 - tr4;
		ch [t5 += t0] = tr2 - tr3;
		ch [t5 += t0] = tr1 + tr4;
		t1 += ido;
		t3 += t2;
	}

	if (ido < 2)
		return;
	if (ido == 2)
		return L105();

	t1 = 0;
	for (let k = 0; k < l1; k++)
	{
		let t5 = (t4 = (t3 = (t2 = t1 << 2) + t6)) + t6;
		let t7 = t1;
		for (let i = 2; i < ido; i += 2)
		{
			t2 += 2;
			t3 += 2;
			t4 -= 2;
			t5 -= 2;
			t7 += 2;
			const ti1 = cc [t2] + cc [t5];
			const ti2 = cc [t2] - cc [t5];
			const ti3 = cc [t3] - cc [t4];
			const tr4 = cc [t3] + cc [t4];
			const tr1 = cc [t2 - 1] - cc [t5 - 1];
			const tr2 = cc [t2 - 1] + cc [t5 - 1];
			const ti4 = cc [t3 - 1] - cc [t4 - 1];
			const tr3 = cc [t3 - 1] + cc [t4 - 1];
			ch [t7 - 1] = tr2 + tr3;
			const cr3 = tr2 - tr3;
			ch [t7] = ti2 + ti3;
			const ci3 = ti2 - ti3;
			const cr2 = tr1 - tr4;
			const cr4 = tr1 + tr4;
			const ci2 = ti1 + ti4;
			const ci4 = ti1 - ti4;

			ch [(t8 = t7 + t0) - 1] = wa [ wa1offset + i - 2] * cr2 - wa [ wa1offset + i - 1] * ci2;
			ch [t8] = wa [ wa1offset + i - 2] * ci2 + wa [ wa1offset + i - 1] * cr2;
			ch [(t8 += t0) - 1] = wa [ wa2offset + i - 2] * cr3 - wa [ wa2offset + i - 1] * ci3;
			ch [t8] = wa [ wa2offset + i - 2] * ci3 + wa [ wa2offset + i - 1] * cr3;
			ch [(t8 += t0) - 1] = wa [ wa3offset + i - 2] * cr4 - wa [ wa3offset + i - 1] * ci4;
			ch [t8] = wa [ wa3offset + i - 2] * ci4 + wa [ wa3offset + i - 1] * cr4;
		}
		t1 += ido;
	}

	if (ido % 2 == 1)
		return;
	L105();

    function L105() {
        t1 = ido;
        t2 = ido << 2;
        t3 = ido - 1;
        t4 = ido + (ido << 1);
        for (let k = 0; k < l1; k++)
        {
            t5 = t3;
            const ti1 = cc [t1] + cc [t4];
            const ti2 = cc [t4] - cc [t1];
            const tr1 = cc [t1 - 1] - cc [t4 - 1];
            const tr2 = cc [t1 - 1] + cc [t4 - 1];
            ch [t5] = tr2 + tr2;
            ch [t5 += t0] = sqrt2 * (tr1 - ti1);
            ch [t5 += t0] = ti2 + ti2;
            ch [t5 += t0] = -sqrt2 * (tr1 + ti1);

            t3 += ido;
            t1 += t2;
            t4 += t2;
        }
    }
}
export function dradf2(ido, l1, cc, ch, wa1, waoffset)
{
	let t1 = 0;
	let t2, t0 = (t2 = l1 * ido);
	let t3 = ido << 1;
	for (let k = 0; k < l1; k++)
	{
		ch [t1 << 1] = cc [t1] + cc [t2];
		ch [(t1 << 1) + t3 - 1] = cc [t1] - cc [t2];
		t1 += ido;
		t2 += ido;
	}

	if (ido < 2)
		return;
	if (ido == 2)
		return L105();

	t1 = 0;
	t2 = t0;
	for (let k = 0; k < l1; k++)
	{
		t3 = t2;
		let t4 = (t1 << 1) + (ido << 1);
		let t5 = t1;
		let t6 = t1 + t1;
		for (let i = 2; i < ido; i += 2)
		{
			t3 += 2;
			t4 -= 2;
			t5 += 2;
			t6 += 2;
			const tr2 = wa1 [waoffset + i - 2] * cc [t3 - 1] + wa1 [waoffset + i - 1] * cc [t3];
			const ti2 = wa1 [waoffset + i - 2] * cc [t3] - wa1 [waoffset + i - 1] * cc [t3 - 1];
			ch [t6] = cc [t5] + ti2;
			ch [t4] = ti2 - cc [t5];
			ch [t6 - 1] = cc [t5 - 1] + tr2;
			ch [t4 - 1] = cc [t5 - 1] - tr2;
		}
		t1 += ido;
		t2 += ido;
	}

	if (ido % 2 == 1)
		return;
	L105();

    function L105() {
        t3 = (t2 = (t1 = ido) - 1);
        t2 += t0;
        for (let k = 0; k < l1; k++)
        {
            ch [t1] = -cc [t2];
            ch [t1 - 1] = cc [t3];
            t1 += ido << 1;
            t2 += ido;
            t3 += ido;
        }
    }
}
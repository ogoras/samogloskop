export function dradb2 (ido, l1, cc, ch, wa1, waoffset)
{
	const t0 = l1 * ido;

	let t1 = 0;
	let t2 = 0;
	let t3 = (ido << 1) - 1;
	for (let k = 0; k < l1; k++)
	{
		ch [t1] = cc [t2] + cc [t3 + t2];
		ch [t1 + t0] = cc [t2] - cc [t3 + t2];
		t2 = (t1 += ido) << 1;
	}

	if (ido < 2)
		return;
	if (ido == 2)
		return L105();

	t1 = 0;
	t2 = 0;
	for (let k = 0; k < l1; k++)
	{
		t3 = t1;
		let t4, t5 = (t4 = t2) + (ido << 1);
		let t6 = t0 + t1;
		for (let i = 2; i < ido; i += 2)
		{
			t3 += 2;
			t4 += 2;
			t5 -= 2;
			t6 += 2;
			ch [t3 - 1] = cc [t4 - 1] + cc [t5 - 1];
			const tr2 = cc [t4 - 1] - cc [t5 - 1];
			ch [t3] = cc [t4] - cc [t5];
			const ti2 = cc [t4] + cc [t5];
			ch [t6 - 1] = wa1 [waoffset + i - 2] * tr2 - wa1 [waoffset + i - 1] * ti2;
			ch [t6] = wa1 [waoffset + i - 2] * ti2 + wa1 [waoffset + i - 1] * tr2;
		}
		t2 = (t1 += ido) << 1;
	}

	if (ido % 2 == 1)
		return;
	L105();

    function L105() {
        t1 = ido - 1;
        t2 = ido - 1;
        for (let k = 0; k < l1; k++)
        {
            ch [t1] = cc [t2] + cc [t2];
            ch [t1 + t0] = -(cc [t2 + 1] + cc [t2 + 1]);
            t1 += ido;
            t2 += ido << 1;
        }
    }
}
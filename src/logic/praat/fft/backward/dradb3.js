export default function dradb3 (ido, l1, cc, ch, wa, wa1offset, wa2offset)
{
	const taur = -.5;
	const taui = .86602540378443864676372317075293618;

	let t0 = l1 * ido;

	let t1 = 0;
	let t2 = t0 << 1;
	let t3 = ido << 1;
	let t4 = ido + (ido << 1);
	let t5 = 0;
	for (let k = 0; k < l1; k++)
	{
		const tr2 = cc [t3 - 1] + cc [t3 - 1];
		const cr2 = cc [t5] + (taur * tr2);
		ch [t1] = cc [t5] + tr2;
		const ci3 = taui * (cc [t3] + cc [t3]);
		ch [t1 + t0] = cr2 - ci3;
		ch [t1 + t2] = cr2 + ci3;
		t1 += ido;
		t3 += t4;
		t5 += t4;
	}

	if (ido == 1)
		return;

	t1 = 0;
	t3 = ido << 1;
	for (let k = 0; k < l1; k++)
	{
		let t7 = t1 + (t1 << 1);
		let t6 = (t5 = t7 + t3);
		let t8 = t1;
		let t9, t10 = (t9 = t1 + t0) + t0;

		for (let i = 2; i < ido; i += 2)
		{
			t5 += 2;
			t6 -= 2;
			t7 += 2;
			t8 += 2;
			t9 += 2;
			t10 += 2;
			const tr2 = cc [t5 - 1] + cc [t6 - 1];
			const cr2 = cc [t7 - 1] + (taur * tr2);
			ch [t8 - 1] = cc [t7 - 1] + tr2;
			const ti2 = cc [t5] - cc [t6];
			const ci2 = cc [t7] + (taur * ti2);
			ch [t8] = cc [t7] + ti2;
			const cr3 = taui * (cc [t5 - 1] - cc [t6 - 1]);
			const ci3 = taui * (cc [t5] + cc [t6]);
			const dr2 = cr2 - ci3;
			const dr3 = cr2 + ci3;
			const di2 = ci2 + cr3;
			const di3 = ci2 - cr3;
			ch [t9 - 1] = wa [wa1offset + i - 2] * dr2 - wa [wa1offset + i - 1] * di2;
			ch [t9] = wa [wa1offset + i - 2] * di2 + wa [wa1offset + i - 1] * dr2;
			ch [t10 - 1] = wa [wa2offset + i - 2] * dr3 - wa [wa2offset + i - 1] * di3;
			ch [t10] = wa [wa2offset + i - 2] * di3 + wa [wa2offset + i - 1] * dr3;
		}
		t1 += ido;
	}
}
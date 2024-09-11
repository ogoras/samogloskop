// drfti1 in Praat
export function drfti1(n, wa, ifac, waoffset = 0) {
	const ntryh = [4, 2, 3, 5];
	const tpi = 6.28318530717958647692528676655900577;
	let ntry = 0, j = -1, nl = n, nf = 0;

	L101();

	function L101() {
		j++;
		if (j < 4) ntry = ntryh[j];
		else ntry += 2;
		return L104();
	}

	function L104() {
		const nq = Math.floor(nl / ntry);
		const nr = nl - ntry * nq;
		if (nr !== 0) return L101();
		nf++;
		ifac[nf + 1] = ntry;
		nl = nq;
		if (ntry !== 2 || nf == 1) return L107();

		for (let i = 1; i < nf; i++) {
			const ib = nf - i + 1;
			ifac[ib + 1] = ifac[ib];
		}
		ifac[2] = 2;
		return L107();
	}

	function L107() {
		if (nl !== 1) return L104();
		ifac[0] = n;
		ifac[1] = nf;
		const argh = tpi / n;
		let is = 0;
		const nfm1 = nf - 1;
		let l1 = 1;

		if (nfm1 === 0)
			return;
		for (let k1 = 0; k1 < nfm1; k1++) {
			const ip = ifac[k1 + 2];
			let ld = 0;
			const l2 = l1 * ip;
			const ido = Math.floor(n / l2);
			const ipm = ip - 1;

			for (j = 0; j < ipm; j++) {
				ld += l1;
				let i = is;
				const argld = ld * argh;

				let fi = 0.0;
				for (let ii = 2; ii < ido; ii += 2) {
					fi += 1.0;
					const arg = fi * argld;
					wa[(i++) + waoffset] = Math.cos(arg);
					wa[(i++) + waoffset] = Math.sin(arg);
				}
				is += ido;
			}
			l1 = l2;
		}
	}
}

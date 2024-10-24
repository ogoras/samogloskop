import dradf2 from './dradf2.js';
import dradf4 from './dradf4.js';
import dradfg from './dradfg.js';

// drftf1 in Praat
export default function drftf1(n, c, ch, ifac, waoffset) {
	const nf = ifac[1];
	let na = 1;
	let l2 = n;
	let iw = n;

	for (let k1 = 0; k1 < nf; k1++) {
		const kh = nf - k1;
		const ip = ifac[kh + 1];
		const l1 = Math.floor(l2 / ip);
		const ido = Math.floor(n / l2);
		const idl1 = ido * l1;
		let ix2, ix3;
		loop();

		function loop() {
			iw -= (ip - 1) * ido;
			na = 1 - na;

			if (ip !== 4) return L102();

			ix2 = iw + ido;
			ix3 = ix2 + ido;
			if (na !== 0)
				dradf4(ido, l1, ch, c, ch, waoffset + iw - 1, waoffset + ix2 - 1, waoffset + ix3 - 1);

			else
				dradf4(ido, l1, c, ch, ch, waoffset + iw - 1, waoffset + ix2 - 1, waoffset + ix3 - 1);
			return L110();
		}

		function L102() {
			if (ip != 2) return L104();
			if (na != 0) return L103();

			dradf2(ido, l1, c, ch, ch, waoffset + iw - 1);
			return L110();
		}

		function L103() {
			dradf2(ido, l1, ch, c, ch, waoffset + iw - 1);
			return L110();
		}

		function L104() {
			if (ido == 1) na = 1 - na;
			if (na != 0) return L109();

			dradfg(ido, ip, l1, idl1, c, c, c, ch, ch, ch, waoffset + iw - 1);
			na = 1;
			return L110();
		}

		function L109() {
			dradfg(ido, ip, l1, idl1, ch, ch, ch, c, c, ch, waoffset + iw - 1);
			na = 0;
			return L110();
		}

		function L110() {
			l2 = l1;
		}
	}

	if (na == 1)
		return;

	for (let i = 0; i < n; i++) c[i] = ch[i];
}

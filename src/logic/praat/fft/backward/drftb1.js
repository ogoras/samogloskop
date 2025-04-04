// NUMfft_core.h in Praat
import dradbg from './dradbg.js';
import dradb2 from './dradb2.js';
import dradb3 from './dradb3.js';
import dradb4 from './dradb4.js';

export default function drftb1 (n, c, ch, ifac, waoffset) // wa[0] = ch[waoffset]
{
	const nf = ifac [1];
	let na = 0;
	let l1 = 1;
	let iw = 1;

	for (let k1 = 0; k1 < nf; k1++)
	{
		const ip = ifac [k1 + 2];
		const l2 = ip * l1;
		const ido = n / l2;
		const idl1 = ido * l1;
		let ix2, ix3;
        loop();

        function loop() {
            if (ip != 4) return L103();
            ix2 = iw + ido;
            ix3 = ix2 + ido;

            if (na != 0)
                dradb4 (ido, l1, ch, c, ch, waoffset + iw - 1, waoffset + ix2 - 1, waoffset + ix3 - 1);
            else
                dradb4 (ido, l1, c, ch, ch, waoffset + iw - 1, waoffset + ix2 - 1, waoffset + ix3 - 1);
            na = 1 - na;
            return L115();
        }

	    function L103() {
            if (ip != 2)
                return L106();

            if (na != 0)
                dradb2 (ido, l1, ch, c, ch, waoffset + iw - 1);
            else
                dradb2 (ido, l1, c, ch, ch, waoffset + iw - 1);
            na = 1 - na;
            return L115();
        }  

	    function L106() {
            if (ip != 3)
                return L109();

            ix2 = iw + ido;
            if (na != 0)
                dradb3 (ido, l1, ch, c, ch, waoffset + iw - 1, waoffset + ix2 - 1);
            else
                dradb3 (ido, l1, c, ch, ch, waoffset + iw - 1, waoffset + ix2 - 1);
            na = 1 - na;
            return L115();
        }

	    function L109() {
            if (na != 0)
                dradbg (ido, ip, l1, idl1, ch, ch, ch, c, c, ch, waoffset + iw - 1);
            else
                dradbg (ido, ip, l1, idl1, c, c, c, ch, ch, ch, waoffset + iw - 1);
            if (ido == 1)
                na = 1 - na;
        }

	    function L115() {
            l1 = l2;
            iw += (ip - 1) * ido;
        }
	}

	if (na == 0) return;

	for (let i = 0; i < n; i++) c [i] = ch [i];
}
// external/lapack/lapack_dlaq.cpp in Praat
/*
    Output:
    {
        wr: Float64Array,
        wi: Float64Array,
        info: number
    }
*/

import { ilaenv_ } from "../ilaenv";
import { dlaqr3_ } from "./dlaqr3";
import { dlaqr4_ } from "./dlaqr4";
import { dlaqr5_ } from "./dlaqr5";
import { dlahqr_ } from "./dlahqr";
import { dlanv2_ } from "./dlanv2";

/* Subroutine */ export function dlaqr0_(n, ihi, h__, ihiz, work, lwork)
{
	let wr = [], wi = [], info;
	const wantt = false;
	const wantz = false;
	const ilo = 1, ldh = n, iloz = 1;
	const z__ = null;
	const ldz = ihiz;

	/* Table of constant values */
	static let c__13 = 13;
	static let c__15 = 15;
	static let c_n1 = -1;
	static let c__12 = 12;
	static let c__14 = 14;
	static let c__16 = 16;
	static let c_false = false;
	static let c__1 = 1;
	static let c__3 = 3;

    /* System generated locals */
    let h_dim1, h_offset, z_dim1, z_offset, i__1, i__2, i__3, i__4, i__5;
    let d__1, d__2, d__3, d__4;

    /* Local variables */
    let i__, k;
    let aa, bb, cc, dd;
    let ld;
    let cs;
    let nh, it, ks, kt;
    let sn;
    let ku, kv, ls, ns;
    let ss;
    let nw, inf, kdu, nho, nve, kwh, nsr, nwr, kwv, ndec, ndfl, kbot, nmin;
    let swap;
    let ktop;
    let zdum = Array(1);	/* was [1][1] */;
    let kacc22, itmax, nsmax, nwmax, kwtop;
    let nibble, nwupbd;
    let jbcmpz = Array(3);
    let sorted;
    let lwkopt;

    // /* Parameter adjustments */
    // h_dim1 = *ldh;
    // h_offset = 1 + h_dim1;
    // h__ -= h_offset;
    // --wr;
    // --wi;
    // z_dim1 = *ldz;
    // z_offset = 1 + z_dim1;
    // z__ -= z_offset;
    // --work;

    /* Function Body */
    info = 0;

/*     ==== Quick return for N = 0: nothing to do. ==== */

    if (n == 0) {
	    work[0] = 1.;
	    return { wr, wi, info };
    }

    if (n <= 11) {

/*        ==== Tiny matrices must use DLAHQR. ==== */

        lwkopt = 1;
        if (lwork != -1) {
            ({wr, wi, info} = dlahqr_(false, false, n, 1, n, h__, n, 1, ihiz, null, ihiz));
        }
    } else {

/*        ==== Use small bulge multi-shift QR with aggressive early */
/*        .    deflation on larger-than-tiny matrices. ==== */

/*        ==== Hope for the best. ==== */

	info = 0;

/*        ==== Set up job flags for ILAENV. ==== */

	if (wantt) {
	     jbcmpz [0] = 'S';
	} else {
	     jbcmpz [0] = 'E';
	}
	if (wantz) {
	     jbcmpz [1] = 'V';
	} else {
	     jbcmpz [1] = 'N';
	}
	jbcmpz [2] = '\0';
/*        ==== NWR = recommended deflation window size.  At this */
/*        .    point,  N .GT. NTINY = 11, so there is enough */
/*        .    subdiagonal workspace for NWR.GE.2 as required. */
/*        .    (In fact, there is enough subdiagonal space for */
/*        .    NWR.GE.3.) ==== */

	nwr = ilaenv_(c__13, "DLAQR0", jbcmpz, n, 1, ihi, lwork);
	nwr = Math.max(2,nwr);
/* Computing MIN */
	i__1 = ihi - ilo + 1, i__2 = Math.floor((n - 1) / 3), i__1 = Math.min(i__1,i__2);
	nwr = Math.min(i__1,nwr);

/*        ==== NSR = recommended number of simultaneous shifts. */
/*        .    At this point N .GT. NTINY = 11, so there is at */
/*        .    enough subdiagonal workspace for NSR to be even */
/*        .    and greater than or equal to two as required. ==== */

	nsr = ilaenv_(c__15, "DLAQR0", jbcmpz, n, 1, ihi, lwork);
/* Computing MIN */
	i__1 = nsr, i__2 = Math.floor((n + 6) / 9), i__1 = Math.min(i__1,i__2), i__2 = ihi - ilo;
	nsr = Math.min(i__1,i__2);
/* Computing MAX */
	i__1 = 2, i__2 = nsr - nsr % 2;
	nsr = Math.max(i__1,i__2);

/*        ==== Estimate optimal workspace ==== */

/*        ==== Workspace query call to DLAQR3 ==== */

	i__1 = nwr + 1;
	({wr, wi} = dlaqr3_(false, false, n, 1, ihi, i__1, h__, ldh, 1,
		ihiz, null, ldz, ls, ld, h__, ldh, n, h__, ldh, n, h__,
		ldh, work, c_n1));

/*        ==== Optimal workspace = MAX(DLAQR5, DLAQR3) ==== */

/* Computing MAX */
	i__1 = Math.floor(nsr * 3 / 2), i__2 =  work[0];
	lwkopt = Math.max(i__1,i__2);

/*        ==== Quick return in case of workspace query. ==== */

	if (lwork == -1) {
	    work[0] =  lwkopt;
	    return { wr, wi, info };
	}

/*        ==== DLAHQR/DLAQR0 crossover point ==== */

	nmin = ilaenv_(c__12, "DLAQR0", jbcmpz, n, 1, ihi, lwork);
	nmin = Math.max(11,nmin);

/*        ==== Nibble crossover point ==== */

	nibble = ilaenv_(c__14, "DLAQR0", jbcmpz, n, 1, ihi, lwork);
	nibble = Math.max(0,nibble);

/*        ==== Accumulate reflections during ttswp?  Use block */
/*        .    2-by-2 structure during matrix-matrix multiply? ==== */

	kacc22 = ilaenv_(c__16, "DLAQR0", jbcmpz, n, 1, ihi, lwork);
	kacc22 = Math.max(0,kacc22);
	kacc22 = Math.min(2,kacc22);

/*        ==== NWMAX = the largest possible deflation window for */
/*        .    which there is sufficient workspace. ==== */

/* Computing MIN */
	i__1 = Math.floor((n - 1) / 3), i__2 = Math.floor(lwork / 2);
	nwmax = Math.min(i__1,i__2);
	nw = nwmax;

/*        ==== NSMAX = the Largest number of simultaneous shifts */
/*        .    for which there is sufficient workspace. ==== */

/* Computing MIN */
	i__1 = Math.floor((n + 6) / 9), i__2 = Math.floor((lwork << 1) / 3);
	nsmax = Math.min(i__1,i__2);
	nsmax -= nsmax % 2;

/*        ==== NDFL: an iteration count restarted at deflation. ==== */

	ndfl = 1;

/*        ==== ITMAX = iteration limit ==== */

/* Computing MAX */
	i__1 = 10, i__2 = ihi - ilo + 1;
	itmax = Math.max(i__1,i__2) * 30;

/*        ==== Last row and column in the active block ==== */

	kbot = ihi;

/*        ==== Main Loop ==== */

	i__1 = itmax;
	for (it = 1; it <= i__1; ++it) {

/*           ==== Done when KBOT falls below ILO ==== */

	    if (kbot < ilo) {
		goto L90;
	    }

/*           ==== Locate active block ==== */

	    i__2 = ilo + 1;
	    for (k = kbot; k >= i__2; --k) {
		if (h__[k + (k - 1) * h_dim1] == 0.) {
		    goto L20;
		}
/* L10: */
	    }
	    k = ilo;
L20:
	    ktop = k;

/*           ==== Select deflation window size: */
/*           .    Typical Case: */
/*           .      If possible and advisable, nibble the entire */
/*           .      active block.  If not, use size MIN(NWR,NWMAX) */
/*           .      or MIN(NWR+1,NWMAX) depending upon which has */
/*           .      the smaller corresponding subdiagonal entry */
/*           .      (a heuristic). */
/*           . */
/*           .    Exceptional Case: */
/*           .      If there have been no deflations in KEXNW or */
/*           .      more iterations, then vary the deflation window */
/*           .      size.   At first, because, larger windows are, */
/*           .      in general, more powerful than smaller ones, */
/*           .      rapidly increase the window to the maximum possible. */
/*           .      Then, gradually reduce the window size. ==== */

		nh = kbot - ktop + 1;
		nwupbd = Math.min(nh,nwmax);
	    if (ndfl < 5) {
		nw = Math.min(nwupbd,nwr);
		} else {
/* Computing MIN */
		i__2 =nwupbd, i__3 = nw << 1;
		nw = Math.min(i__2,i__3);
		}
		if (nw < nwmax) {
		if (nw >= nh - 1) {
			nw = nh;
		} else {
			kwtop = kbot - nw + 1;
			if ((d__1 = h__[kwtop + (kwtop - 1) * h_dim1], abs(d__1))
				> (d__2 = h__[kwtop - 1 + (kwtop - 2) * h_dim1],
				abs(d__2))) {
			++nw;
				}
			}
		    }
		    if (ndfl < 5) {
			ndec = -1;
			} else if (ndec >= 0 || nw >= nwupbd) {
			++ndec;
			if (nw - ndec < 2) {
		    ndec = 0;
			}
			nw -= ndec;
			}

/*           ==== Aggressive early deflation: */
/*           .    split workspace under the subdiagonal into */
/*           .      - an nw-by-nw work array V in the lower */
/*           .        left-hand-corner, */
/*           .      - an NW-by-at-least-NW-but-more-is-better */
/*           .        (NW-by-NHO) horizontal work array along */
/*           .        the bottom edge, */
/*           .      - an at-least-NW-but-more-is-better (NHV-by-NW) */
/*           .        vertical work array along the left-hand-edge. */
/*           .        ==== */

	    kv = n - nw + 1;
	    kt = nw + 1;
	    nho = n - nw - 1 - kt + 1;
	    kwv = nw + 2;
	    nve = n - nw - kwv + 1;

/*           ==== Aggressive early deflation ==== */

	    ({wr, wi} = dlaqr3_(false, false, n, ktop, kbot, nw, h__, ldh,
		    1, ihiz, null, ldz, ls, ld,
		     h__[kv + h_dim1], ldh, nho, h__[kv + kt * h_dim1],
		    ldh, nve, h__[kwv + h_dim1], ldh, work, lwork));

/*           ==== Adjust KBOT accounting for new deflations. ==== */

	    kbot -= ld;

/*           ==== KS points to the shifts. ==== */

	    ks = kbot - ls + 1;

/*           ==== Skip an expensive QR sweep if there is a (partly */
/*           .    heuristic) reason to expect that many eigenvalues */
/*           .    will deflate without it.  Here, the QR sweep is */
/*           .    skipped if many eigenvalues have just been deflated */
/*           .    or if the remaining active block is small. */

	    if (ld == 0 || ld * 100 <= nw * nibble && kbot - ktop + 1 > Math.min(
		    nmin,nwmax)) {

/*              ==== NS = nominal number of simultaneous shifts. */
/*              .    This may be lowered (slightly) if DLAQR3 */
/*              .    did not provide that many shifts. ==== */

/* Computing MIN */
/* Computing MAX */
		i__4 = 2, i__5 = kbot - ktop;
		i__2 = Math.min(nsmax,nsr), i__3 = Math.max(i__4,i__5);
		ns = Math.min(i__2,i__3);
		ns -= ns % 2;

/*              ==== If there have been no deflations */
/*              .    in a multiple of KEXSH iterations, */
/*              .    then try exceptional shifts. */
/*              .    Otherwise use shifts provided by */
/*              .    DLAQR3 above or from the eigenvalues */
/*              .    of a trailing principal submatrix. ==== */

		if (ndfl % 6 == 0) {
		    ks = kbot - ns + 1;
/* Computing MAX */
		    i__3 = ks + 1, i__4 = ktop + 2;
		    i__2 = Math.max(i__3,i__4);
		    for (i__ = kbot; i__ >= i__2; i__ += -2) {
			ss = (d__1 = h__[i__ + (i__ - 1) * h_dim1], abs(d__1))
				 + (d__2 = h__[i__ - 1 + (i__ - 2) * h_dim1],
				abs(d__2));
			aa = ss * .75 + h__[i__ + i__ * h_dim1];
			bb = ss;
			cc = ss * -.4375;
			dd = aa;
			dlanv2_(aa, bb, cc, dd, wr[i__ - 1], wi[i__ - 1]
, wr[i__], wi[i__], cs, sn);
/* L30: */
		    }
		    if (ks == ktop) {
			wr[ks + 1] = h__[ks + 1 + (ks + 1) * h_dim1];
			wi[ks + 1] = 0.;
			wr[ks] = wr[ks + 1];
			wi[ks] = wi[ks + 1];
		    }
		} else {

/*                 ==== Got NS/2 or fewer shifts? Use DLAQR4 or */
/*                 .    DLAHQR on a trailing principal submatrix to */
/*                 .    get more. (Since NS.LE.NSMAX.LE.(N+6)/9, */
/*                 .    there is enough space below the subdiagonal */
/*                 .    to fit an NS-by-NS scratch array.) ==== */

		    if (kbot - ks + 1 <= Math.floor(ns / 2)) {
			ks = kbot - ns + 1;
			kt = n - ns + 1;
			dlacpy_("A", ns, ns, h__[ks + ks * h_dim1], ldh, h__[kt + h_dim1], ldh);
			if (ns > nmin) {
			    dlaqr4_(c_false, c_false, ns, c__1, ns, h__[
				    kt + h_dim1], ldh, wr[ks], wi[ks], c__1, c__1, zdum, c__1, work, lwork,
				     inf);
			} else {
			    dlahqr_(c_false, c_false, ns, c__1, ns, h__[
				    kt + h_dim1], ldh, wr[ks], wi[ks], c__1, c__1, zdum, c__1, inf);
			}
			ks += inf;

/*                    ==== In case of a rare QR failure use */
/*                    .    eigenvalues of the trailing 2-by-2 */
/*                    .    principal submatrix.  ==== */

			if (ks >= kbot) {
			    aa = h__[kbot - 1 + (kbot - 1) * h_dim1];
			    cc = h__[kbot + (kbot - 1) * h_dim1];
			    bb = h__[kbot - 1 + kbot * h_dim1];
			    dd = h__[kbot + kbot * h_dim1];
			    dlanv2_(aa, bb, cc, dd, wr[kbot - 1], wi[
				    kbot - 1], wr[kbot], wi[kbot], cs, sn)
				    ;
			    ks = kbot - 1;
			}
		    }

		    if (kbot - ks + 1 > ns) {

/*                    ==== Sort the shifts (Helps a little) */
/*                    .    Bubble sort keeps complex conjugate */
/*                    .    pairs together. ==== */

			sorted = false;
			i__2 = ks + 1;
			for (k = kbot; k >= i__2; --k) {
			    if (sorted) {
				goto L60;
			    }
			    sorted = true;
			    i__3 = k - 1;
			    for (i__ = ks; i__ <= i__3; ++i__) {
				if ((d__1 = wr[i__], abs(d__1)) + (d__2 = wi[
					i__], abs(d__2)) < (d__3 = wr[i__ + 1]
					, abs(d__3)) + (d__4 = wi[i__ + 1],
					abs(d__4))) {
				    sorted = false;

				    swap = wr[i__];
				    wr[i__] = wr[i__ + 1];
				    wr[i__ + 1] = swap;

				    swap = wi[i__];
				    wi[i__] = wi[i__ + 1];
				    wi[i__ + 1] = swap;
				}
/* L40: */
			    }
/* L50: */
			}
L60:
			;
		    }

/*                 ==== Shuffle shifts into pairs of real shifts */
/*                 .    and pairs of complex conjugate shifts */
/*                 .    assuming complex conjugate shifts are */
/*                 .    already adjacent to one another. (Yes, */
/*                 .    they are.)  ==== */

		    i__2 = ks + 2;
		    for (i__ = kbot; i__ >= i__2; i__ += -2) {
			if (wi[i__] != -wi[i__ - 1]) {

			    swap = wr[i__];
			    wr[i__] = wr[i__ - 1];
			    wr[i__ - 1] = wr[i__ - 2];
			    wr[i__ - 2] = swap;

			    swap = wi[i__];
			    wi[i__] = wi[i__ - 1];
			    wi[i__ - 1] = wi[i__ - 2];
			    wi[i__ - 2] = swap;
			}
/* L70: */
		    }
		}

/*              ==== If there are only two shifts and both are */
/*              .    real, then use only one.  ==== */

		if (kbot - ks + 1 == 2) {
		    if (wi[kbot] == 0.) {
			if ((d__1 = wr[kbot] - h__[kbot + kbot * h_dim1], abs(
				d__1)) < (d__2 = wr[kbot - 1] - h__[kbot +
				kbot * h_dim1], abs(d__2))) {
			    wr[kbot - 1] = wr[kbot];
			} else {
			    wr[kbot] = wr[kbot - 1];
			}
		    }
		}

/*              ==== Use up to NS of the the smallest magnatiude */
/*              .    shifts.  If there aren't NS shifts available, */
/*              .    then use them all, possibly dropping one to */
/*              .    make the number of shifts even. ==== */

/* Computing MIN */
		i__2 = ns, i__3 = kbot - ks + 1;
		ns = Math.min(i__2,i__3);
		ns -= ns % 2;
		ks = kbot - ns + 1;

/*              ==== Small-bulge multi-shift QR sweep: */
/*              .    split workspace under the subdiagonal into */
/*              .    - a KDU-by-KDU work array U in the lower */
/*              .      left-hand-corner, */
/*              .    - a KDU-by-at-least-KDU-but-more-is-better */
/*              .      (KDU-by-NHo) horizontal work array WH along */
/*              .      the bottom edge, */
/*              .    - and an at-least-KDU-but-more-is-better-by-KDU */
/*              .      (NVE-by-KDU) vertical work WV arrow along */
/*              .      the left-hand-edge. ==== */

		kdu = ns * 3 - 3;
		ku = n - kdu + 1;
		kwh = kdu + 1;
		nho = n - kdu - 3 - (kdu + 1) + 1;
		kwv = kdu + 4;
		nve = n - kdu - kwv + 1;

/*              ==== Small-bulge multi-shift QR sweep ==== */

		dlaqr5_(wantt, wantz, kacc22, n, ktop, kbot, ns, wr[ks],
			wi[ks], h__, ldh, iloz, ihiz, z__[
			z_offset], ldz, work, c__3, h__[ku + h_dim1],
			ldh, nve, h__[kwv + h_dim1], ldh, nho, h__[ku +
			kwh * h_dim1], ldh);
	    }

/*           ==== Note progress (or the lack of it). ==== */

	    if (ld > 0) {
		ndfl = 1;
	    } else {
		++ndfl;
	    }

/*           ==== End of main loop ==== */
/* L80: */
	}

/*        ==== Iteration limit exceeded.  Set INFO to show where */
/*        .    the problem occurred and exit. ==== */

	info = kbot;
L90:
	;
    }

/*     ==== Return the optimal value of LWORK. ==== */

    work[0] =  lwkopt;

/*     ==== End of DLAQR0 ==== */

    return { wr, wi, info };
} /* dlaqr0_ */
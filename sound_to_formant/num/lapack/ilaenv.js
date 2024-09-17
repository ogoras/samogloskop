/* Subroutine */ export function ilaenv_(ispec, name__, opts, n1, n2, n3, n4)
{
    return iparmq_(ispec, name__, opts, n1, n2, n3, n4)
/*     End of ILAENV */

} /* ilaenv_ */

/* Subroutine */ function iparmq_(ispec, name__, opts, n, ilo, ihi, lwork)
{
    /* System generated locals */
    let ret_val, i__1, i__2;
    let r__1;

    /* Local variables */
    let nh, ns;

    if (ispec == 15 || ispec == 13 || ispec == 16) {

/*        ==== Set the number simultaneous shifts ==== */

	nh = ihi - ilo + 1;
	ns = 2;
	if (nh >= 30) {
	    ns = 4;
	}
	if (nh >= 60) {
	    ns = 10;
	}
	if (nh >= 150) {
/* Computing MAX */
	    r__1 = Math.log( nh) / Math.log(2.);
	    i__1 = 10, i__2 = nh / i_nint(r__1);
	    ns = Math.max(i__1,i__2);
	}
	if (nh >= 590) {
	    ns = 64;
	}
	if (nh >= 3000) {
	    ns = 128;
	}
	if (nh >= 6000) {
	    ns = 256;
	}
/* Computing MAX */
	i__1 = 2, i__2 = ns - ns % 2;
	ns = Math.max(i__1,i__2);
    }

    if (ispec == 12) {


/*        ===== Matrices of order smaller than NMIN get sent */
/*        .     to xLAHQR, the classic double shift algorithm. */
/*        .     This must be at least 11. ==== */

	ret_val = 75;

    } else if (ispec == 14) {

/*        ==== INIBL: skip a multi-shift qr iteration and */
/*        .    whenever aggressive early deflation finds */
/*        .    at least (NIBBLE*(window size)/100) deflations. ==== */

	ret_val = 14;

    } else if (ispec == 15) {

/*        ==== NSHFTS: The number of simultaneous shifts ===== */

	ret_val = ns;

    } else if (ispec == 13) {

/*        ==== NW: deflation window size.  ==== */

	if (nh <= 500) {
	    ret_val = ns;
	} else {
	    ret_val = ns * 3 / 2;
	}

    } else if (ispec == 16) {

/*        ==== IACC22: Whether to accumulate reflections */
/*        .     before updating the far-from-diagonal elements */
/*        .     and whether to use 2-by-2 block structure while */
/*        .     doing it.  A small amount of work could be saved */
/*        .     by making this choice dependent also upon the */
/*        .     NH=IHI-ILO+1. */

	ret_val = 0;
	if (ns >= 14) {
	    ret_val = 1;
	}
	if (ns >= 14) {
	    ret_val = 2;
	}

    } else {
/*        ===== invalid value of ispec ===== */
        throw new Error("Invalid value of ispec");
	ret_val = -1;

    }

/*     ==== End of IPARMQ ==== */

    return ret_val;
} /* iparmq_ */

function i_nint(x) {
    return x >= 0 ? Math.floor(x + 0.5) : -Math.floor(0.5 - x);
}
// external/lapack/clapack.cpp in Praat
/*
    Output:
    {
        wr: Float64Array,
        wi: Float64Array,
        info: number
    }
*/

import { dlaqr0_ } from "./dlaq/dlaqr0";

export function dhseqr_(n, h__, work, lwork)
{
    const job = "E";
    const compz = "N";
    const ilo = 1;
    const ihi = n;
    const z__ = null;
    const ldh = n, ldz = n;

    let info, wr = [], wi = [];

	/* Table of constant values */
	let c_b11 = 0.;
	let c_b12 = 1.;
	let c__12 = 12;
	let c__2 = 2;
	let c__49 = 49;

    /* System generated locals */
    let a__1 = Array(2);
    let h_dim1, h_offset, z_dim1, z_offset, i__1, i__2 = Array(2), i__3;
    let d__1;
    let ch__1 = Array (3); 

    /* Local variables */
    let i__;
    let hl = Array(2401)	/* was [49][49] */;
    let kbot, nmin;
    let initz;
    let workl = Array(49);
    let wantt, wantz;
    let lquery;


/*     ==== Decode and check the input parameters. ==== */

    // /* Parameter adjustments */
    // h_dim1 = n;
    // h_offset = 1 + n;
    // h__ -= h_offset;
    // --wr;
    // --wi;
    // z_dim1 = n;
    // z_offset = 1 + n;
    // z__ -= z_offset;
    // --work;

    /* Function Body */
    wantt = false;
    initz = false;
    wantz = false;
    work[0] = Math.max(1,n);
    lquery = lwork == -1;

    info = 0;
    if (n < 0) {
	    info = -3;
    } else if (n < 1) {
	    info = -5;
    } else if (lwork < n && !lquery) {
	    info = -13;
    }

    if (info != 0) {

/*        ==== Quick return in case of invalid argument. ==== */

        throw new Error("dhseqr_: " + (-info));
        return {wr, wi, info};

    } else if (n == 0) {

/*        ==== Quick return in case N = 0; nothing to do. ==== */

	    return {wr, wi, info};

    } else if (lquery) {

/*        ==== Quick return in case of a workspace query ==== */

        ({wr, wi, info} = dlaqr0_(n, n, h__, n, work, lwork));
/*        ==== Ensure reported workspace size is backward-compatible with */
/*        .    previous LAPACK versions. ==== */
/* Computing MAX */
        d__1 = Math.max(1,n);
        work[0] = Math.max(d__1, work[0]);
        return {wr, wi, info};

    } else {

/*        ==== Quick return if possible ==== */

        if (n == 1) return {wr: [h__[0]], wi: [0.], info};

/*        ==== DLAHQR/DLAQR0 crossover point ==== */

/* Writing concatenation */
        ch__1 = ["E", "N", '\0'];
        nmin = ilaenv_(c__12, "DHSEQR", ch__1, n, 1, n, lwork);
        nmin = Math.max(11, nmin);

/*        ==== DLAQR0 for big matrices; DLAHQR for small ones ==== */

        if (n > nmin) {
            ({wr, wi, info} = dlaqr0_(n, n, h__, n, work, lwork));
        } else {

/*           ==== Small matrix ==== */

            dlahqr_(false, false, n, 1, n, h__, ldh, wr[1],
                wi[1], ilo, ihi, null, ldz, info);

            if (info > 0) {

    /*              ==== A rare DLAHQR failure!  DLAQR0 sometimes succeeds */
    /*              .    when DLAHQR fails. ==== */

                kbot = info;

                if (n >= 49) {

    /*                 ==== Larger matrices have enough subdiagonal scratch */
    /*                 .    space to call DLAQR0 directly. ==== */

                    ({wr, wi, info} = dlaqr0_(n, kbot, h__, n, work, lwork));
                } else {

    /*                 ==== Tiny matrices don't have enough subdiagonal */
    /*                 .    scratch space to benefit from DLAQR0.  Hence, */
    /*                 .    tiny matrices must be copied into a larger */
    /*                 .    array before calling DLAQR0. ==== */

                    dlacpy_("A", n, n, h__[h_offset], ldh, hl, c__49);
                    hl[n + 1 + n * 49 - 50] = 0.;
                    i__1 = 49 - n;
                    dlaset_("A", c__49, i__1, c_b11, c_b11, hl[(n + 1) *
                        49 - 49], c__49);
                    ({wr, wi, info} = dlaqr0_(c__49, kbot, hl, n, workl, c__49));
                    if (wantt || info != 0) {
                    dlacpy_("A", n, n, hl, c__49, h__[h_offset], ldh);
                    }
                }
            }
        }

    /*        ==== Clear out the trash, if necessary. ==== */

        if ((wantt || info != 0) && n > 2) {
            i__1 = n - 2;
            i__3 = n - 2;
            dlaset_("L", i__1, i__3, c_b11, c_b11, h__[h_dim1 + 3], ldh);
        }

    /*        ==== Ensure reported workspace size is backward-compatible with */
    /*        .    previous LAPACK versions. ==== */

    /* Computing MAX */
        d__1 = Math.max(1,n);
        work[1] =Math.max(d__1,work[1]);
    }

/*     ==== End of DHSEQR ==== */

    return {wr, wi, info};
} /* dhseqr_ */

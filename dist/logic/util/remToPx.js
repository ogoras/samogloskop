export default function remToPx(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

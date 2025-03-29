export default function convertSecondsToTimeString(seconds) {
    function twoDigits(num) { return num.toString().padStart(2, '0'); }
    const hh = Math.floor(seconds / 3600);
    const mm = twoDigits(Math.floor(seconds / 60) % 60);
    const ss = twoDigits(seconds % 60);
    return `${hh}:${mm}:${ss}`;
}
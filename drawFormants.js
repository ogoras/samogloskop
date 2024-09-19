let canvas = document.getElementsByClassName("formants")[0];
let canvasCtx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
let trail = [];

export function drawFormants(F1, F2) {
    canvasCtx.fillStyle = "rgb(220, 200, 220)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    trail.push({ F1, F2 })
    if (trail.length > 20) {
        trail.shift();
    }

    for (let i = 0; i < trail.length; i++) {
        let weight = (i + 1) / trail.length;
        canvasCtx.fillStyle = "rgba(0, 0, 0, " + weight + ")";
        F1 = trail[i].F1;
        F2 = trail[i].F2;
        F1 /= 2;
        F2 -= 400;
        F2 /= 4;
        canvasCtx.fillRect(WIDTH - F2, F1, weight * 5, weight * 5);
    }
}
let canvas = document.getElementsByClassName("formants")[0];
let canvasCtx, width, height;
onResize();

let trail = [];


export function drawFormants(F1, F2) {
    if (Math.abs(canvas.clientWidth - width) > 1 || Math.abs(canvas.clientHeight !== height) > 1) onResize();
    canvasCtx.fillStyle = "rgb(255, 240, 255)";
    canvasCtx.fillRect(0, 0, width, height);
    trail.push({ F1, F2 })
    if (trail.length > 20) {
        trail.shift();
    }
    canvasCtx.strokeStyle = "rgba(127, 0, 255, 0.2)";
    canvasCtx.beginPath();
    let { x, y } = formantsToXY(vowels.a);
    canvasCtx.moveTo(x, y);
    ({ x, y } = formantsToXY(vowels.i));
    canvasCtx.lineTo(x, y);
    ({ x, y } = formantsToXY(vowels.u));
    canvasCtx.lineTo(x, y);
    ({ x, y } = formantsToXY(vowels.o));
    canvasCtx.lineTo(x, y);
    ({ x, y } = formantsToXY(vowels.a));
    canvasCtx.lineTo(x, y);
    canvasCtx.stroke();

    for (const [key, value] of Object.entries(vowels)) {
        canvasCtx.fillStyle = value.color;
        let { x, y } = formantsToXY(value);
        canvasCtx.fillRect(x, y, 5, 5);
        canvasCtx.font = "20px Arial";
        canvasCtx.fillText(key, x + 10, y + 10);
    }

    for (let i = 0; i < trail.length; i++) {
        let weight = (i + 1) / trail.length;
        canvasCtx.fillStyle = "rgba(0, 0, 0, " + weight + ")";
        let { x, y } = formantsToXY(trail[i]);
        canvasCtx.fillRect(x, y, weight * 5, weight * 5);
    }
}

function onResize() {
    canvas.style.aspectRatio = "1/1";
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;
    canvasCtx = canvas.getContext("2d");
}
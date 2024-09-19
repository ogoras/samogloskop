let canvas = document.getElementsByClassName("formants")[0];
let canvasCtx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
let trail = [];
let vowels = {
    a : { F1: 800, F2: 1300, color: "rgb(255, 0, 0)" },
    e : { F1: 660, F2: 1600, color: "rgb(250, 165, 0)" },
    i : { F1: 300, F2: 2300, color: "rgb(0, 255, 0)" },
    o : { F1: 580, F2: 900, color: "rgb(255, 0, 255)" },
    u : { F1: 320, F2: 630, color: "rgb(0, 0, 255)"  },
    y : { F1: 480, F2: 1750, color: "rgb(150, 75, 0)" }
}

export function drawFormants(F1, F2) {
    canvasCtx.fillStyle = "rgb(255, 240, 255)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
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

function formantsToXY(formants) {
    let F1 = formants.F1;
    let F2 = formants.F2;
    F1 /= 2;
    F2 -= 400;
    F2 /= 4;
    return { x: WIDTH - F2, y: F1 }
}
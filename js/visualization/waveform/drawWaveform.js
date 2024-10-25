// visualizer based on code from https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone/scripts/app.js
export default function drawWaveform(dataArray, bufferLength, canvas, canvasCtx) {
    const WIDTH = canvas.clientWidth;
    const HEIGHT = canvas.clientHeight;
    if (Math.abs(WIDTH - canvas.width) > 10) {
        console.log(`Changing canvas width from ${canvas.width} to ${WIDTH}`);
        canvas.width = WIDTH;
    }
    // if (Math.abs(HEIGHT - canvas.height) > 10) {
    //     console.log(`Changing canvas height from ${canvas.height} to ${HEIGHT}`);
    //     canvas.height = HEIGHT;
    // }
    canvasCtx.fillStyle = "white";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    canvasCtx.beginPath();

    let sliceWidth = (WIDTH * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i];
        let y = (v * HEIGHT) / 2;
        y += HEIGHT / 2;

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    canvasCtx.stroke();
}

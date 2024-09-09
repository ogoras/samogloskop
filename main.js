var stream = null;
try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
}
catch (error) {
    console.log("An error occured: " + error);
}
var audioCtx = null, source = null, audioBufferData = [], recorderNode = null;
var initialized = false, recording = false;

var recordingIndicator = document.querySelector('.recording-indicator');

async function init() {
    audioCtx = new AudioContext();
    source = audioCtx.createMediaStreamSource(stream);
    await audioCtx.audioWorklet.addModule('recorder-worklet-processor.js');
    recorderNode = new AudioWorkletNode(audioCtx, 'recorder-processor');
    recorderNode.port.onmessage = (event) => {
        const inputData = event.data;
        audioBufferData.push(new Float32Array(inputData));
    };
}

async function startRecording() {
    audioBufferData = [];
    if (!initialized) {
        await init();
        initialized = true;
    }
    // Step 7: Connect the source to the AudioWorkletNode and the node to the destination
    source.connect(recorderNode);
    recorderNode.connect(audioCtx.destination);
    recordingIndicator.style.display = 'block';
    recording = true;
}

function stopRecording() {
    recorderNode.disconnect();
    source.disconnect();
    recordingIndicator.style.display = 'none';
    recording = false;

    // Concatenate all recorded audio chunks
    const totalLength = audioBufferData.reduce((total, chunk) => total + chunk.length, 0);
    const audioBuffer = audioCtx.createBuffer(1, totalLength, audioCtx.sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    let offset = 0;
    for (const chunk of audioBufferData) {
        channelData.set(chunk, offset);
        offset += chunk.length;
    }

    console.log('AudioBuffer:', audioBuffer);
}

var recordButton = document.querySelector('.record-button');
// mouse, touch, or spacebar
recordButton.addEventListener('mousedown', startRecording);
recordButton.addEventListener('touchstart', startRecording);
addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !recording) {
        startRecording();
    }
});
recordButton.addEventListener('mouseup', stopRecording);
recordButton.addEventListener('touchend', stopRecording);
addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        stopRecording();
    }
});

// visualizer based on code from https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone/scripts/app.js
var canvas = document.querySelector("canvas");
var canvasCtx = canvas.getContext("2d");
const bufferLength = 1024;
const dataArray = new Float32Array(bufferLength);

function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    if (audioBufferData.length < bufferLength / 128) {
        requestAnimationFrame(draw);
        return;
    }

    for (let i = 1; i <= bufferLength; i++) {
        dataArray[bufferLength - i] = audioBufferData[Math.floor(audioBufferData.length - i / 128)][(128 - i + 2**15) % 128];
    }
    canvasCtx.fillStyle = "rgb(200, 200, 200)";
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

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();

    requestAnimationFrame(draw);
}

draw();
import { soundToFormant } from './sound_to_formant/formant.js';

let stream = null;
try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
}
catch (error) {
    console.log("An error occured: " + error);
}
let audioCtx = null, source = null, audioBufferData = [], recorderNode = null;
let initialized = false, recording = false;

let recordingIndicator = document.querySelector('.recording-indicator');

async function init() {
    audioCtx = new AudioContext();
    source = audioCtx.createMediaStreamSource(stream);
    await audioCtx.audioWorklet.addModule('recorder-worklet-processor.js');
    recorderNode = new AudioWorkletNode(audioCtx, 'recorder-processor');
    recorderNode.port.onmessage = (event) => {
        const inputData = event.data;
        audioBufferData.push(...inputData);
    };
}

async function startRecording() {
    if (recording) return;
    audioBufferData = [];
    if (!initialized) {
        await init();
        initialized = true;
    }
    // Step 7: Connect the source to the AudioWorkletNode and the node to the destination
    source.connect(recorderNode);
    recordingIndicator.style.display = 'block';
    recording = true;
}

function stopRecording() {
    if (!recording) return;
    source.disconnect();
    recordingIndicator.style.display = 'none';
    recording = false;
}

let recordButton = document.querySelector('.record-button');
// mouse, touch, or spacebar
recordButton.addEventListener('mousedown', startRecording);
recordButton.addEventListener('touchstart', startRecording);
addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
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
let canvas = document.querySelector("canvas");
let canvasCtx = canvas.getContext("2d");
const bufferLength = 1024;
const dataArray = new Float32Array(bufferLength);

function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    if (audioBufferData.length < bufferLength / 128) {
        requestAnimationFrame(draw);
        return;
    }

    const dt = 0; // if 0 is passed, the function will calculate it based on window size
    const nFormants = 5;
    const maximumFrequency = 5000;
    const halfdt_window = 0.025;
    const preemphasisFrequency = 50;
    const samples = [...audioBufferData];
    audioBufferData = [];
    const formants = soundToFormant([...samples], audioCtx.sampleRate, dt, nFormants, maximumFrequency, halfdt_window, preemphasisFrequency);
    
    if (bufferLength > samples.length) {
        console.log("Before: " + samples.length);
        samples.splice(0, 0, ...dataArray.slice(samples.length, bufferLength));
        console.log("After: " + samples.length);
    }
    dataArray.set(samples.slice(samples.length - bufferLength, samples.length));
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
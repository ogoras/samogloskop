import { drawWaveform } from './drawWaveform.js';
import { drawFormants } from './drawFormants.js';
import { soundToFormant } from './sound_to_formant/formant.js';
//import { exampleSamples } from './sound_to_formant/example_samples.js';

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
    let hintElements = document.getElementsByClassName("record-press-me");
    for (let i = 0; i < hintElements.length; i++) {
        hintElements[i].style.display = "none";
    }

    if (recording) return;
    audioBufferData = [];
    if (!initialized) {
        await init();
        initialized = true;
    }
    // Step 7: Connect the source to the AudioWorkletNode and the node to the destination
    source.connect(recorderNode);
    recordingIndicator.style.backgroundColor = 'red';
    recording = true;
}

function stopRecording() {
    if (!recording) return;
    source.disconnect();
    recordingIndicator.style.backgroundColor = '#ff000000';
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

const bufferLength = 1024;
const dataArray = new Float32Array(bufferLength);

function draw() {
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
    //const formants = soundToFormant(exampleSamples, audioCtx.sampleRate, dt, nFormants, maximumFrequency, halfdt_window, preemphasisFrequency);
    for (let i = 0; i < formants.length; i++) {
        if (formants[i].formant.length >= 2) {
            drawFormants(formants[i].formant[0].frequency, formants[i].formant[1].frequency);
        }
    }

    if (bufferLength > samples.length) {
        samples.splice(0, 0, ...dataArray.slice(samples.length, bufferLength));
    }
    dataArray.set(samples.slice(samples.length - bufferLength, samples.length));

    drawWaveform(dataArray, bufferLength);

    requestAnimationFrame(draw);
}

draw();



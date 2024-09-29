import { drawWaveform } from './drawWaveform.js';
import { drawFormants } from './drawFormants.js';
import { soundToFormant } from './sound_to_formant/formant.js';
import { AudioRecorder } from './recorder.js';

const audioRecorder = new AudioRecorder();

const bufferLength = 1024;
const dataArray = new Float32Array(bufferLength);

function draw() {
    const audioBufferData = audioRecorder.audioBufferData;
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
    audioRecorder.flush();
    const formants = soundToFormant([...samples], audioRecorder.sampleRate, dt, nFormants, maximumFrequency, halfdt_window, preemphasisFrequency);
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



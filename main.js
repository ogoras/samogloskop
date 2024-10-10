import { AudioRecorder } from './recorder.js';
import { FormantVisualizer } from './FormantVisualizer.js';
import { WaveformVisualizer } from './WaveformVisualizer.js';

const audioRecorder = new AudioRecorder();
await audioRecorder.init();
const formantVisualizer = new FormantVisualizer(audioRecorder.sampleRate);
const waveformVisualizer = new WaveformVisualizer();
audioRecorder.onStart = () => {
    formantVisualizer.reset();
    waveformVisualizer.reset();
};

// iterate through all input elements within #formants-options
document.querySelectorAll("#formants-options input").forEach(input => {
    function update() {
        if (parseFloat(input.value) < parseFloat(input.min)) input.value = parseFloat(input.min);
        formantVisualizer.updateParameter(input.id, parseFloat(input.value));
    }
    input.addEventListener("keydown", (event) => {
        if (event.key != "Enter") return;
        update();
    });
    input.addEventListener("focusout", () => {
        console.log("focusout");
        update();
    });
});

function draw() {
    if (audioRecorder.samplesCollected < WaveformVisualizer.bufferLength / 128) {
        requestAnimationFrame(draw);
        return;
    }

    const samples = audioRecorder.dump();

    formantVisualizer.feed(samples);
    waveformVisualizer.feed(samples);

    requestAnimationFrame(draw);
}

draw();



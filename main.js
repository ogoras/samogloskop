import { AudioRecorder } from './Recorder.js';
import { FormantVisualizer } from './FormantVisualizer.js';
import { WaveformVisualizer } from './WaveformVisualizer.js';

const audioRecorder = new AudioRecorder();
await audioRecorder.init();
const formantVisualizer = new FormantVisualizer(audioRecorder.sampleRate);
const waveformVisualizer = new WaveformVisualizer();
audioRecorder.onStart = () => {
    formantVisualizer.recordingStarted();
    waveformVisualizer.reset();
};

audioRecorder.onStop = () => {
    formantVisualizer.recordingStopped();
}

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



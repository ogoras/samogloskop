import { View } from './View.js';
import { AudioRecorder } from '../Recorder.js';
import { FormantProcessor } from '../FormantProcessor.js';
import { WaveformVisualizer } from '../WaveformVisualizer.js';
import { STATES, STATE_NAMES } from '../definitions/states.js';
import { FORMANT_VIEWS } from '../calibration/view/FormantViews.js';

export class RecordingView extends View {
    constructor(onStateChange, state, preset) {
        super(onStateChange);

        // add a div before the main container
        let formantsContainer = this.formantsContainer = document.createElement("div");
        formantsContainer.classList.add("formants-container");
        formantsContainer.id = "formants";
        document.body.insertBefore(formantsContainer, this.mainContainer);
        let centerDiv = document.createElement("div");
        centerDiv.classList.add("center");
        formantsContainer.appendChild(centerDiv);
        let stackDiv = document.createElement("div");
        stackDiv.classList.add("stack");
        centerDiv.appendChild(stackDiv);

        let recordingContainer = document.createElement("div");
        recordingContainer.classList.add("recording-container");
        this.mainContainer.appendChild(recordingContainer);
        let recordButton = document.createElement("div");
        recordButton.classList.add("record-button");
        recordButton.innerHTML = "🎙️";
        recordingContainer.appendChild(recordButton);
        let recordingIndicator = document.createElement("div");
        recordingIndicator.classList.add("recording-indicator");
        recordingContainer.appendChild(recordingIndicator);
        let hint = document.createElement("div");
        hint.classList.add("record-press-me");
        hint.innerHTML = `<h5><b>←</b></h5>
            <p class="gray">Naciśnij przycisk, żeby włączyć nasłuchiwanie</p>`;
        recordingContainer.appendChild(hint);

        let canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 100;
        canvas.classList.add("visualizer");
        canvas.classList.add("fl");
        this.mainContainer.appendChild(canvas);

        this.audioRecorder = new AudioRecorder();
        this.formantProcessor = new FormantProcessor(this.audioRecorder.sampleRate, state, preset);
        this.waveformVisualizer = new WaveformVisualizer();
        this.audioRecorder.onStart = () => {
            this.formantProcessor.recordingStarted();
            if (this.view) this.view.recordingStarted();
            this.waveformVisualizer.reset();
        };

        this.audioRecorder.onStop = () => {
            if (this.view) this.formantProcessor.recordingStopped();
            this.view.recordingStopped();
        }

        this.updateView(state);
        this.draw();
    }
    
    updateView(state) {
        let Constructor = FORMANT_VIEWS[state];
        if (Constructor) {
            if (this.view) {
                if (Constructor !== this.view.constructor) {
                    this.view = new Constructor(this.view, this.formantProcessor);
                }
                else if (state === STATES.SPEECH_MEASURED) {
                    this.view.finish();
                }
                else if (state === STATES.MEASURING_SPEECH) {
                    this.view.speechDetected = true;
                }
                else if (state === STATES.GATHERING_VOWELS) {
                    this.view.speechDetected = true;
                }
            }
            else this.view = new Constructor(this.formantsContainer, this.formantProcessor, state);
        }
    }

    draw() {
        if (this.audioRecorder.samplesCollected < WaveformVisualizer.bufferLength / 128) {
            requestAnimationFrame(this.draw.bind(this));
            return;
        }

        const samples = this.audioRecorder.dump();

        let updates = this.formantProcessor.feed(samples);

        let intensityStats = updates.intensityStats;
        if (intensityStats) this.view.update(intensityStats);

        let buffer = updates.formants;
        if (buffer) this.view.feed(buffer);

        let progressTime = updates.progressTime;
        if (progressTime !== undefined  && this.view.updateProgress) this.view.updateProgress(progressTime);
        let progress = updates.progress;
        if (progress !== undefined && this.view.updateProgress) this.view.updateProgress(progress, false);

        let newState = updates.newState;
        if (newState !== undefined) {
            this.onStateChange({ newState, calibration: updates.intensityStatsString  }, false);
            this.updateView(newState);
        }

        let startTime = updates.startTime;
        if (startTime !== undefined) this.view.startTime = startTime;

        this.waveformVisualizer.feed(samples);

        requestAnimationFrame(this.draw.bind(this));
    }
}
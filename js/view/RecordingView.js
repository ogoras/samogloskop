import View from './View.js';
import WaveformVisualizer from '../visualization/waveform/WaveformVisualizer.js';
import { STATES, STATE_NAMES } from '../const/states.js';
import SPEECH_VIEWS from './formant_view/SPEECH_VIEWS.js';
import SettingsView from './SettingsView.js';

export default class RecordingView extends View {
    #UPDATE_FUNCTION = {
        intensityStats: (x) => { this.view?.update?.(x); },
        formants: (x, y) => { this.view?.feed?.(x, y); },
        formantsSmoothed: (x, y) => { this.view?.feedSmoothed?.(x, y); },
        formantsSaved: (x) => { this.view?.saveFormants?.(x); },
        vowel: (vowel) => { this.view?.vowelCentroid?.(vowel); },
        progressTime: (time) => { this.view?.updateProgress?.(time); },
        progress: (progress) => { this.view?.updateProgress?.(progress, false); },
        startTime: (time) => { if (this.view) this.view.startTime = time; },
    }

    constructor(onStateChange, recorder) {
        super(onStateChange);
        if (!recorder) throw new Error("Recorder not given to RecordingView");
        this.recorder = recorder;

        document.body.innerHTML = "";
        document.body.classList.add("recording-view");

        let formantsContainer = this.formantsContainer = document.createElement("div");
        formantsContainer.classList.add("formants-container");
        formantsContainer.id = "formants";
        document.body.appendChild(formantsContainer);
        let centerDiv = document.createElement("div");
        centerDiv.classList.add("center");
        formantsContainer.appendChild(centerDiv);
        let stackDiv = document.createElement("div");
        stackDiv.classList.add("stack");
        centerDiv.appendChild(stackDiv);

        let sideContainer = this.sideContainer = document.createElement("div");
        sideContainer.classList.add("side-container");
        document.body.appendChild(sideContainer);
        let recordingContainer = document.createElement("div");
        recordingContainer.classList.add("recording-container");
        this.sideContainer.appendChild(recordingContainer);

        async function toggleCallback() {
            switch(await this.recorder.toggleRecording()) {
                case "started":
                    this.recordingStarted();
                    break;
                case "stopped":
                    this.recordingStopped();
                    break;
            }
        }
        
        let recordButton = this.recordButton = document.createElement("div");
        recordButton.classList.add("emoji-button");
        recordButton.classList.add("strikethrough-button");
        recordButton.id = "record-button";
        recordButton.innerHTML = "🎙️";
        recordButton.addEventListener("click", toggleCallback.bind(this));
        recordingContainer.appendChild(recordButton);

        addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                toggleCallback.bind(this)();
            }
        });

        let recordingIndicator = this.recordingIndicator = document.createElement("div");
        recordingIndicator.classList.add("recording-indicator");
        recordingContainer.appendChild(recordingIndicator);

        let hint = this.hint = document.createElement("div");
        hint.classList.add("record-press-me");
        hint.innerHTML = `<h5><b>←</b></h5>
            <p class="gray">Naciśnij przycisk, żeby włączyć nasłuchiwanie</p>`;
        recordingContainer.appendChild(hint);

        let visualizer = document.createElement("div");
        visualizer.classList.add("visualizer");
        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = 0;
        visualizer.appendChild(canvas);
        recordingContainer.appendChild(visualizer);
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        let settingsButton = document.createElement("div");
        settingsButton.classList.add("emoji-button");
        settingsButton.innerHTML = "⚙️";
        settingsButton.addEventListener("click", this.openSettings.bind(this));
        recordingContainer.appendChild(settingsButton);

        this.waveformVisualizer = new WaveformVisualizer();
    }
    
    updateView(state, formantProcessor) {
        this.formantProcessor = formantProcessor;
        let Constructor = SPEECH_VIEWS[state];
        if (Constructor) {
            if (this.view) {
                if (Constructor !== this.view.constructor) {
                    this.view = new Constructor(this.view, formantProcessor);
                }
                else switch(state) {
                    case STATES.SPEECH_MEASURED:
                        this.view.finish();
                        break;
                    case STATES.MEASURING_SPEECH:
                    case STATES.GATHERING_VOWELS:
                        this.view.speechDetected = true;
                        break;
                    case STATES.WAITING_FOR_VOWELS:
                        this.view.speechDetected = false;
                        break;
                    case STATES.VOWEL_GATHERED:
                        this.view.vowelGathered = true;
                        break;
                }
            }
            else this.view = new Constructor(this.formantsContainer, formantProcessor, state);
        }
    }

    feed(samples, updates, rescalePlots) {
        for (let [key, value] of Object.entries(updates)) {
            if (value !== undefined && value !== null) this.#UPDATE_FUNCTION[key]?.(value, rescalePlots);
        }
        this.waveformVisualizer.feed(samples);
    }

    addDataset(vowels) {
        this.view?.addDataset?.(vowels);
    }

    recordingStarted() {
        this.hint.style.display = "none";
        this.recordButton.classList.add('hide-strikethrough');
        this.recordingIndicator.style.backgroundColor = 'red';
        this.view?.recordingStarted();
        this.waveformVisualizer.reset();
    }

    recordingStopped() {
        this.recordButton.classList.remove('hide-strikethrough');
        this.recordingIndicator.style.backgroundColor = '#ff000000';
        this.view?.recordingStopped();
    }

    openSettings() {
        this.recorder.stopRecording();
        document.body.classList.remove("recording-view");
        this.formantsContainer.style.display = "none";
        this.sideContainer.style.display = "none";
        if (!this.formantProcessor) throw new Error("FormantProcessor not given to RecordingView");
        this.popup = new SettingsView(this.onStateChange, this.closeSettings.bind(this), this.formantProcessor);
    }

    closeSettings() {
        document.body.classList.add("recording-view");
        this.formantsContainer.style.display = "block";
        this.sideContainer.style.display = "block";
        this.view.restore?.();
    }
}
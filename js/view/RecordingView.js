import View from './View.js';
import WaveformVisualizer from './visualization/waveform/WaveformVisualizer.js';
import SPEECH_VIEWS from './speech_view/SPEECH_VIEWS.js';
import SettingsView from './SettingsView.js';

export default class RecordingView extends View {
    #disabled = false;

    /**
     * @param {boolean} value
     */
    set disabled(value) {
        this.#disabled = value;
        this.recordButton.classList.toggle("disabled", value);
        if (value) this.recordingStopped();
    }

    get disabled() {
        return this.#disabled;
    }

    #UPDATE_FUNCTION = {
        intensityStats: (x) => { this.view?.update?.(x); },
        formants: (x, y) => { this.view?.feed?.(x, y); },
        formantsSmoothed: (x, y) => { this.view?.feedSmoothed?.(x, y); },
        formantsSaved: (x) => { this.view?.saveFormants?.(x); },
        vowel: (vowel) => { this.view?.vowelCentroid?.(vowel); },
        progressTime: (time) => { this.view?.updateProgress?.(time); },
        progress: (progress) => { this.view?.updateProgress?.(progress, false); },
        startTime: (time) => { if (this.view) this.view.startTime = time; },
        vowelGathered: (value) => { this.view.vowelGathered = value; },
        speechDetected: (value) => { this.view.speechDetected = value; },
    }

    constructor(controller, recorder) {
        super(controller);
        if (!recorder) throw new Error("Recorder not given to RecordingView");
        this.recorder = recorder;

        document.body.innerHTML = "";
        document.body.classList.add("recording-view");

        const formantsContainer = this.formantsContainer = document.createElement("div");
        formantsContainer.classList.add("formants-container");
        formantsContainer.id = "formants";
        document.body.appendChild(formantsContainer);
        const centerDiv = document.createElement("div");
        centerDiv.classList.add("center");
        formantsContainer.appendChild(centerDiv);
        const stackDiv = document.createElement("div");
        stackDiv.classList.add("stack");
        centerDiv.appendChild(stackDiv);

        const sideContainer = this.sideContainer = document.createElement("div");
        sideContainer.classList.add("side-container");
        document.body.appendChild(sideContainer);
        const recordingContainer = document.createElement("div");
        recordingContainer.classList.add("recording-container");
        this.sideContainer.appendChild(recordingContainer);

        async function toggleCallback() {
            if (this.disabled) return;
            switch(await this.recorder.toggleRecording()) {
                case "started":
                    this.recordingStarted();
                    break;
                case "stopped":
                    this.recordingStopped();
                    break;
            }
        }
        
        const recordButton = this.recordButton = document.createElement("div");
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

        const recordingIndicator = this.recordingIndicator = document.createElement("div");
        recordingIndicator.classList.add("recording-indicator");
        recordingContainer.appendChild(recordingIndicator);

        const hint = this.hint = document.createElement("div");
        hint.classList.add("record-press-me");
        hint.innerHTML = `<h5><b>←</b></h5>
            <p class="gray">Naciśnij przycisk, żeby włączyć nasłuchiwanie</p>`;
        recordingContainer.appendChild(hint);

        const visualizer = document.createElement("div");
        visualizer.classList.add("visualizer");
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 0;
        visualizer.appendChild(canvas);
        recordingContainer.appendChild(visualizer);
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const settingsButton = document.createElement("div");
        settingsButton.classList.add("emoji-button");
        settingsButton.innerHTML = "⚙️";
        settingsButton.addEventListener("click", this.openSettings.bind(this));
        recordingContainer.appendChild(settingsButton);

        this.waveformVisualizer = new WaveformVisualizer();

        this.updateView();
    }
    
    updateView() {
        const state = this.controller.sm.state;
        const Constructor = SPEECH_VIEWS[state.name];
        if (Constructor) {
            if (this.view) {
                if (Constructor !== this.view.constructor) {
                    this.view = new Constructor(this.controller, this.view, true);
                }
                else switch(state.name) {
                    case "SPEECH_MEASURED":
                        this.view.finish();
                        break;
                    case "MEASURING_SPEECH":
                    // case "GATHERING_VOWELS":
                        this.view.speechDetected = true;
                        break;
                    // case "WAITING_FOR_VOWELS":
                    //     this.view.speechDetected = false;
                    //     break;
                    // case "VOWEL_GATHERED":
                    //     this.view.vowelGathered = true;
                    //     break;
                }
            }
            else this.view = new Constructor(this.controller, this.formantsContainer);
        }
    }

    feed(samples, updates, rescalePlots) {
        if (updates) {
            for (let [key, value] of Object.entries(updates)) {
                if (value !== undefined && value !== null) this.#UPDATE_FUNCTION[key]?.(value, rescalePlots);
            }
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
        this.recordingStopped();
        document.body.classList.remove("recording-view");
        this.formantsContainer.style.display = "none";
        this.sideContainer.style.display = "none";
        this.popup = new SettingsView(this.controller.settingsController, this.closeSettings.bind(this), this.args);
        this.controller.pauseRendering?.();
    }

    closeSettings() {
        document.body.classList.add("recording-view");
        this.formantsContainer.style.display = "block";
        this.sideContainer.style.display = "block";
        this.view.restore?.();
        this.controller.resumeRendering?.();
    }

    initializeRecordings(recordings) {
        this.view?.initializeRecordings?.(recordings);
    }
}
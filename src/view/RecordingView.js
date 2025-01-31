import View from './View.js';
import WaveformVisualizer from './visualization/waveform/WaveformVisualizer.js';
import SPEECH_VIEWS from './speech/SPEECH_VIEWS.js';
import SettingsView from './SettingsView.js';
import MoreInfo from './components/MoreInfo.js';

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

    get timer() {
        return this.view?.timer;
    }

    /**
     * @param {number} time
     */
    set startTime(time) {
        if (this.view) this.view.startTime = time;
    }

    /**
     * @param {IntensityStats} stats
     */
    set intensityStats(stats) {
        if (this.view) this.view.intensityStats = stats;
    }

    /**
     * @param {number} time
     */
    set progressTime(time) {
        this.view?.updateProgress?.(time);
    }

    /**
     * @param {number} percentage
     */
    set progress(percentage) {
        this.view?.updateProgress?.(percentage, false);
    }

    /**
     * @param {number} percentage
     */
    set secondaryProgress(percentage) {
        this.view?.updateSecondaryProgress?.(percentage);
    }

    /**
     * @param {boolean} value
     */
    set speechDetected(value) {
        if (this.view) this.view.speechDetected = value;
    }

    /**
     * @param {boolean} value
     */
    set vowelGathered(value) {
        if (this.view) this.view.vowelGathered = value;
    }

    feedFormants(formants, rescalePlots = true) {
        if (!formants) return;
        this.view?.feed?.(formants, rescalePlots);
    }

    feedSmoothed(formants, rescalePlots = true) {
        if (!formants) return;
        this.view?.feedSmoothed?.(formants, rescalePlots);
    }

    feedSaved(formants) {
        if (!formants) return;
        this.view?.saveFormants?.(formants);
    }

    feedVowel(vowel) {
        this.view?.vowelCentroid?.(vowel);
    }

    finish() {
        this.view?.finish?.();
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

        this.moreInfo = new MoreInfo(sideContainer);

        this.updateView();
    }
    
    updateView() {
        this.view?.destroy?.();
        const state = this.controller.sm.state;
        const Constructor = SPEECH_VIEWS[state.name];
        if (Constructor) {
            if (this.view) {
                // if (Constructor !== this.view.constructor) {
                this.view = new Constructor(this.controller, this.view, true, this);
                // }
            }
            else this.view = new Constructor(this.controller, this.formantsContainer, false, this);
        }
    }

    feed(samples) {
        this.waveformVisualizer.feed(samples);
    }

    addDatasets(...args) {
        this.view?.addDatasets?.(...args);
    }

    addWords(...args) {
        this.view?.addWords?.(...args);
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

    destroy() {
        this.view?.destroy?.();
        this.recorder.stopRecording();
        document.body.innerHTML = "";
        document.body.classList.remove("recording-view");

        this.moreInfo.destroy();
    }
}
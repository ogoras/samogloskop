import View from './View.js';
import SPEECH_VIEWS from './speech/SPEECH_VIEWS.js';
import SettingsView from './SettingsView.js';
import FormantsComponent from './components/recording/FormantsComponent.js';
import SideComponent from './components/recording/SideComponent.js';

export default class RecordingView extends View {
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

        document.body.innerHTML = "";
        document.body.classList.add("recording-view");
        
        this.formantsComponent = new FormantsComponent();
        this.formantsComponent.addDivStack();
        
        this.sideComponent = new SideComponent(this, recorder);

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
        this.sideComponent.feed(samples);
    }

    addDatasets(...args) {
        this.view?.addDatasets?.(...args);
    }

    addWords(...args) {
        this.view?.addWords?.(...args);
    }

    recordingStarted() {
        this.view?.recordingStarted();
    }

    recordingStopped() {
        this.view?.recordingStopped();
    }

    openSettings() {
        this.sideComponent.stopRecording();
        document.body.classList.remove("recording-view");
        this.formantsContainer.hidden = true;
        this.sideContainer.hidden = true;
        this.popup = new SettingsView(this.controller.settingsController, this.closeSettings.bind(this), this.args);
        this.controller.pauseRendering?.();
    }

    closeSettings() {
        document.body.classList.add("recording-view");
        this.formantsContainer.hidden = false;
        this.sideContainer.hidden = false;
        this.view.restore?.();
        this.controller.resumeRendering?.();
    }

    initializeRecordings(recordings) {
        this.view?.initializeRecordings?.(recordings);
    }

    destroy() {
        this.formantsComponent.destroy();
        this.sideComponent.destroy();
        this.view?.destroy?.();
        document.body.innerHTML = "";
        document.body.classList.remove("recording-view");
    }
}
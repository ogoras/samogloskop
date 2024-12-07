import View from "../View.js";
export default class SpeechView extends View {
    #recording = false;
    constructor(controller, view) {
        super(controller);
        if (this.constructor === SpeechView) {
            throw new Error("Cannot instantiate abstract class FormantView");
        }
        if (view instanceof View) {
            this.#recording = view.recording;
        }
    }
    refreshRecording() {
        this.recording = this.#recording;
    }
    toggleRecording() {
        this.recording = !this.#recording;
    }
    /**
     * @param {boolean} value
     */
    set recording(value) {
        this.#recording = value;
        if (value) {
            this.recordingStarted();
        }
        else {
            this.recordingStopped();
        }
    }
    get recording() {
        return this.#recording;
    }
    recordingStarted() {
        this.#recording = true;
    }
    recordingStopped() {
        this.#recording = false;
    }
}

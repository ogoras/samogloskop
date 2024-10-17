export class FormantView {
    constructor() {
        if (this.constructor === FormantView)
            throw new Error("Cannot instantiate abstract class FormantView");
    }

    #recording = false;

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

    recordingStarted() {
        this.#recording = true;
    }
    recordingStopped() {
        this.#recording = false;
    }
}
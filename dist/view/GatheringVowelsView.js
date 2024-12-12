import View from "./View.js";
export default class GatheringVowelsView extends View {
    constructor(parent) {
        super(parent.controller);
        this.parent = parent;
    }
    #hintKeepGoing = false;
    #vowelGathered = false;
    get startedSpeakingVowel() {
        return this.#vowelGathered || this.#hintKeepGoing;
    }
    /**
     * @param {boolean} value
     */
    set vowelGathered(value) {
        if (!value)
            throw new Error("Cannot unset vowelGathered");
        this.#vowelGathered = true;
        this.#hintKeepGoing = false;
        this.parent.refreshRecording();
    }
    vowelGatheredOnSpeechDetected(value) {
        if (value)
            return false;
        let ret = false;
        if (this.#vowelGathered) {
            this.#vowelGathered = false;
            ret = true;
        }
        else {
            this.#hintKeepGoing = true;
        }
        return ret;
    }
    recordingStarted(sayWhat) {
        if (this.#vowelGathered) {
            this.parent.h2.innerHTML = "Świetnie! Sekunda przerwy...";
        }
        else {
            this.parent.h2.innerHTML =
                (this.#hintKeepGoing ? "Jeszcze trochę, mów" : "Powiedz")
                    + sayWhat;
        }
        return this.#vowelGathered;
    }
}

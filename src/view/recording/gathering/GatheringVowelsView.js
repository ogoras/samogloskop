import StackComponent from "../../components/stack/StackComponent.js";
import RecordingView from "../RecordingView.js"

export default class GatheringVowelsView extends RecordingView {
    #hintKeepGoing = false;
    #vowelGathered = false;

    get startedSpeakingVowel() {
        return this.#vowelGathered || this.#hintKeepGoing;
    }

    /**
     * @param {boolean} value
     */
    set vowelGathered(value) {
        if (!value) throw new Error("Cannot unset vowelGathered");
        this.#vowelGathered = true;
        this.#hintKeepGoing = false;
        this.refreshRecording();
    }

    constructor(controller, recorder, prev) {
        super(controller, recorder, prev);
        prev?.sideComponent?.selectorsComponent?.destroy();
        this.stackComponent.removeAllExceptH2();
        this.stackComponent = new StackComponent(null, this.stackComponent);
    }

    set secondaryProgress(percentage) {
        this.stackComponent.updateSecondaryProgress?.(percentage);
    }

    vowelGatheredOnSpeechDetected(value) {
        if (value) return false;

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
        super.recordingStarted?.();

        if (this.#vowelGathered) {
            this.stackComponent.h2.innerHTML = "Świetnie! Sekunda przerwy...";
        }
        else {
            this.stackComponent.h2.innerHTML = 
                (this.#hintKeepGoing ? "Jeszcze trochę, mów" : "Powiedz")
                + sayWhat;
        }
        return this.#vowelGathered;
    }
}
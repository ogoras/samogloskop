import GatheringVowelsView from "./GatheringVowelsView.js";
import PlotComponent from "../../../components/PlotComponent.js";
import ConfirmVowelsView from "../confirm/ConfirmVowelsView.js";

export default class GatheringNativeView extends GatheringVowelsView {
    #speechDetected = false;
    #plotInitialized = false;

    /**
     * @param {boolean} value
     */
    set speechDetected(value) {
        if (value == this.#speechDetected) 
            throw new Error("Setter tried to set speechDetected to the same value");

        this.#speechDetected = value;
        if (!this.#plotInitialized) {
            this.#plotInitialized = true;
            this.initializePlot();
            this.recordingStarted();
        }
        if (this.vowelGatheredOnSpeechDetected(value)) {
            this.currentVowel = this.nativeVowels.nextVowel();
            this.refreshRecording();
        }
    }

    constructor(controller, recorder, prev) {
        super(controller, recorder, prev);

        this.nativeVowels = controller.nativeVowels;
        this.currentVowel = this.nativeVowels.nextVowel();

        if (prev.constructor === ConfirmVowelsView) {
            // this.#speechDetected = true;
            this.plotComponent = prev.plotComponent;
            this.#plotInitialized = true;
        }
        this.refreshRecording();
        this.stackComponent.h2.innerHTML = "Kalibracja samogłosek:<br>" + this.stackComponent.h2.innerHTML;
    }

    feedSaved(formants) {
        if (!formants) return;
        this.assertSpeechFormants();
        this.plotComponent.saveFormants(formants, this.currentVowel.id);
    }

    feedVowel(vowel) {
        this.plotComponent.vowelCentroid(vowel);
    }

    recordingStarted() {
        super.recordingStarted(` <q>${this.currentVowel.letter.repeat(3)}</q>, głośno i wyraźnie...`)
    }

    recordingStopped() {
        super.recordingStopped();
        this.stackComponent.h2.innerHTML = "Włącz mikrofon, aby kontynuować kalibrację...";
    }

    assertSpeechFormants() {
        if (!this.#speechDetected) throw new Error("Given formants without speech detected");
    }

    initializePlot() {
        // move the divStack element to .main-container below the recording container
        delete this.formantsComponent.stackComponent;
        this.sideComponent.recordingComponent.element.after(this.stackComponent.element);
        // clear sideComponent
        this.formantsComponent.clear();
        this.plotComponent = new PlotComponent(this, this.controller.formantCount);

        this.refreshRecording();
    }
}
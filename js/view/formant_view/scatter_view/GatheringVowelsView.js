import ScatterView from './ScatterView.js';

export default class GatheringVowelsView extends ScatterView {
    #speechDetected = false;
    #plotInitialized = false;
    #hintKeepGoing = false;
    #vowelGathered = false;

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
        if (!value) {
            if (this.#vowelGathered) {
                this.currentVowel = this.userVowels.nextVowel();
                this.#vowelGathered = false;
            }
            else {
                this.#hintKeepGoing = true;
            }
            this.refreshRecording();
        }
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

    constructor(view, formantProcessor) {
        super(view);

        this.userVowels = formantProcessor.userVowels;
        this.currentVowel = this.userVowels.nextVowel();

        // remove all elements from divStack except h2
        let divStack = this.divStack;
        while (divStack.lastChild !== this.h2) {
            divStack.removeChild(divStack.lastChild);
        }
        this.recordingStarted();
        this.h2.innerHTML = "Kalibracja samogłosek:<br>" + this.h2.innerHTML;
    }

    feed(formants) {
        this.assertSpeechFormants();
        super.feed(formants);
    }

    feedSmoothed(formants) {
        this.assertSpeechFormants();
        super.feedSmoothed(formants);
    }

    saveFormants(formants) {
        this.assertSpeechFormants();
        super.saveFormants(formants);
    }

    recordingStarted() {
        super.recordingStarted();
        if (this.#vowelGathered) {
            this.h2.innerHTML = "Świetnie! Sekunda przerwy...";
        }
        else {
            this.h2.innerHTML = 
                (this.#hintKeepGoing ? "Jeszcze trochę, mów" : "Powiedz")
                + ` <q>${this.currentVowel.letter.repeat(3)}</q>, głośno i wyraźnie...`;
        }
    }

    recordingStopped() {
        super.recordingStopped();
        this.h2.innerHTML = "Włącz mikrofon, aby kontynuować kalibrację...";
    }

    assertSpeechFormants() {
        if (!this.#speechDetected) throw new Error("Given formants without speech detected");
    }
}
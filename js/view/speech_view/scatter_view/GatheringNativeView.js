import ConfirmVowelsView from './ConfirmVowelsView.js';
import ScatterView from './ScatterView.js';
import GatheringVowelsView from '../../GatheringVowelsView.js';

export default class GatheringNativeView extends ScatterView {
    #speechDetected = false;
    #plotInitialized = false;

    gatheringVowelsView = new GatheringVowelsView(this);

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
        if (this.gatheringVowelsView.vowelGatheredOnSpeechDetected(value)) {
            this.currentVowel = this.nativeVowels.nextVowel();
            this.refreshRecording();
        }
    }

    /**
     * @param {boolean} value
     */
    set vowelGathered(value) {
        this.gatheringVowelsView.vowelGathered = value;
    }

    constructor(controller, view, recycle = false) {
        super(controller, view, recycle);

        this.nativeVowels = controller.nativeVowels;
        this.currentVowel = this.nativeVowels.nextVowel();

        // remove all elements from divStack except h2
        const divStack = this.divStack;
        while (divStack.lastChild !== this.h2) {
            divStack.removeChild(divStack.lastChild);
        }
        if (view.constructor === ConfirmVowelsView) {
            // this.#speechDetected = true;
            this.scatterPlot = view.scatterPlot;
            this.#plotInitialized = true;
        }
        this.refreshRecording();
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
        super.saveFormants(formants, this.currentVowel.id);
    }

    recordingStarted() {
        super.recordingStarted();
        this.gatheringVowelsView.recordingStarted(` <q>${this.currentVowel.letter.repeat(3)}</q>, głośno i wyraźnie...`)
    }

    recordingStopped() {
        super.recordingStopped();
        this.h2.innerHTML = "Włącz mikrofon, aby kontynuować kalibrację...";
    }

    assertSpeechFormants() {
        if (!this.#speechDetected) throw new Error("Given formants without speech detected");
    }
}
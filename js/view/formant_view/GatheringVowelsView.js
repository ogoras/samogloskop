import { FormantView } from './FormantView.js';
import { ScatterPlot } from '../../visualization/ScatterPlot.js';
import { formantCount } from '../../data/FormantProcessor.js';

export class GatheringVowelsView extends FormantView {
    #speechDetected = false;
    #plotInitialized = false;
    #hintKeepGoing = false;
    #vowelGathered = false;

    /**
     * @param {boolean} value
     */
    set speechDetected(value) {
        if (value == this.#speechDetected) throw new Error("Setter tried to set speechDetected to the same value");

        this.#speechDetected = value;
        if (!this.#plotInitialized) {
            this.#plotInitialized = true;
            this.initializePlot();
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

    set vowelGathered(value) {
        if (!value) throw new Error("Cannot unset vowelGathered");
        this.#vowelGathered = true;
        this.#hintKeepGoing = false;
        this.refreshRecording();
    }

    constructor(view, formantProcessor) {
        super();

        this.userVowels = formantProcessor.userVowels;
        this.currentVowel = this.userVowels.nextVowel();

        this.div = view.div;
        let divStack = this.divStack = view.divStack;
        this.h2 = view.h2;

        // remove all elements from divStack except h2
        while (divStack.lastChild !== this.h2) {
            divStack.removeChild(divStack.lastChild);
        }
        this.recordingStarted();
        this.h2.innerHTML = "Kalibracja samogłosek:<br>" + this.h2.innerHTML;
    }

    initializePlot() {
        // move the divStack element to .main-container in between the div and the canvas
        let mainContainer = document.querySelector(".main-container");
        mainContainer.appendChild(this.divStack);
        mainContainer.insertBefore(this.divStack, document.querySelector("canvas"));
        // remove everything from div
        while (this.div.firstChild) {
            this.div.removeChild(this.div.firstChild);
        }
        this.scatterPlot = new ScatterPlot("formants", true, "Hz");
        this.scatterPlot.addSeries([]);
        this.scatterPlot.addSeries([], true, formantCount);
        this.scatterPlot.addSeries([]);
        this.recordingStarted();
    }

    feed(formants) {
        if (!this.#speechDetected) throw new Error("Given formants without speech detected");
        for (let formant of formants) {
            this.scatterPlot.feed(formant, -2);
        }
    }

    feedSmoothed(formants) {
        if (!this.#speechDetected) throw new Error("Given formants without speech detected");
        
        this.scatterPlot.setSeriesSingle(formants, -1, 50);
    }

    saveFormants(formants) {
        if (!this.#speechDetected) throw new Error("Given formants without speech detected");

        formants.size = 5;
        formants.color += "80";
        this.scatterPlot.feed(formants, -3);
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
}
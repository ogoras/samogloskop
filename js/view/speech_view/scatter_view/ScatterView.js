import SpeechView from '../SpeechView.js';
import ScatterPlot from '../../../visualization/scatter_plot/ScatterPlot.js';
import { formantCount } from '../../../data/FormantProcessor.js';
import { POINT_SIZES } from '../../../const/POINT_SIZES.js';
import { VOWEL_INVENTORIES } from '../../../const/vowel_inventories/VOWEL_INVENTORIES.js';

export default class ScatterView extends SpeechView {
    constructor(onStateChange, arg, state) {
        if (state === undefined) {
            super(onStateChange, arg);
        } else {
            super(onStateChange);
        }
        if (this.constructor === ScatterView) {
            throw new Error("Cannot instantiate abstract class ScatterView");
        }
        if (state === undefined) {
            let view = arg;
            this.div = view.div;
            this.divStack = view.divStack;
            this.h2 = view.h2;
        }
        else {
            let div = this.div = arg;
            this.divStack = document.createElement("div");
            this.divStack.classList.add("stack");
            this.h2 = document.createElement("h2");
            this.h2.classList.add("center");
            this.divStack.appendChild(this.h2);
            this.initializePlot();
        }
    }

    initializePlot(unit) {
        // move the divStack element to .main-container below the recording container
        let sideContainer = document.querySelector(".side-container");
        sideContainer.appendChild(this.divStack);
        document.querySelector(".recording-container").after(this.divStack);
        // remove everything from div
        while (this.div.firstChild) {
            this.div.removeChild(this.div.firstChild);
        }
        this.scatterPlot = new ScatterPlot("formants", true, unit);
        
        let vowelInv = VOWEL_INVENTORIES.PL;
        for (let i = 0; i < vowelInv.length; i++) {
            let vowel = vowelInv[i];
            let ids = this.scatterPlot.appendGroup({ 
                nested: true, 
                formatting: { rgb: vowel.rgb },
                onClick: this.vowelClicked ? () => this.vowelClicked(vowel) : undefined
            }, 0);
            this.scatterPlot.appendGroup({ formatting: {
                size: POINT_SIZES.USER_DATAPOINTS,
                opacity: "80",
            }}, ids);
            this.scatterPlot.appendGroup({ formatting: {
                size: POINT_SIZES.VOWEL_CENTROID
            }}, ids);
        }
        this.scatterPlot.appendGroup({ capacity: formantCount, growSize: true, formatting: {
            size: POINT_SIZES.TRAIL,
            opacity: "80"
        }}, 1);
        this.scatterPlot.appendGroup({ formatting: {
            size: POINT_SIZES.CURRENT
        }}, 1);
        this.refreshRecording();
    }

    saveFormants(formants, vowelId = 0) {
        this.scatterPlot.feed(formants, [0, vowelId, 0]);
    }

    vowelCentroid(vowel) {
        this.scatterPlot.feed(vowel.avg, [0, vowel.id, 1]);
    }

    feed(formants, rescale = true) {
        for (let formant of formants) {
            this.scatterPlot.feed(formant, [-1, 0], rescale);
        }
    }

    feedSmoothed(formants, rescale = true) {
        this.scatterPlot.setSeriesSingle(formants, [-1, 1], 50, rescale);
    }

    restore() {
        this.scatterPlot.restore();
    }
}
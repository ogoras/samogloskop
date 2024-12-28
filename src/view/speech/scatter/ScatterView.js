import SpeechView from '../SpeechView.js';
import ScatterPlot from '../../visualization/scatter_plot/ScatterPlot.js';
import { POINT_SIZES } from '../../../const/POINT_SIZES.js';
import { VOWEL_INVENTORIES } from '../../../const/VOWEL_INVENTORIES.js';

export default class ScatterView extends SpeechView {
    constructor(controller, arg, recycle = false) {
        if (recycle) {
            super(controller, arg);
        } else {
            super(controller);
        }

        this.formantCount = controller.formantCount;

        if (this.constructor === ScatterView) {
            throw new Error("Cannot instantiate abstract class ScatterView");
        }
        if (recycle) {
            const view = arg;
            this.div = view.div;
            this.divStack = view.divStack;
            this.h2 = view.h2;
        }
        else {
            this.div = arg;
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
        const sideContainer = document.querySelector(".side-container");
        sideContainer.appendChild(this.divStack);
        document.querySelector(".recording-container").after(this.divStack);
        // remove everything from div
        while (this.div.firstChild) {
            this.div.removeChild(this.div.firstChild);
        }
        this.scatterPlot = new ScatterPlot("formants", true, unit);
        
        const vowelInv = VOWEL_INVENTORIES.PL;
        for (let i = 0; i < vowelInv.length; i++) {
            const vowel = vowelInv[i];
            const ids = this.scatterPlot.appendGroup({ 
                nested: true, 
                formatting: { rgb: vowel.rgb },
                onClick: this.vowelClicked ? () => this.vowelClicked(vowel) : undefined
            }, 0);
            this.scatterPlot.appendGroup({ formatting: {
                text: vowel.letter,
                size: POINT_SIZES.USER_DATAPOINTS,
                opacity: "FF",
            }}, ids);
            this.scatterPlot.appendGroup({}, ids);  // ellipse
            this.scatterPlot.appendGroup({ formatting: {
                text: vowel.letter,
                size: POINT_SIZES.USER_CENTROIDS,
                glow: true
            }}, ids);
        }
        this.scatterPlot.appendGroup({ capacity: this.formantCount, growSize: true, formatting: {
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

    vowelEllipse(ellipse, vowelId = 0) {
        this.scatterPlot.addEllipse(ellipse, [0, vowelId, 1]);
    }

    vowelCentroid(vowel) {
        this.scatterPlot.feed(vowel.avg, [0, vowel.id, 2]);
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
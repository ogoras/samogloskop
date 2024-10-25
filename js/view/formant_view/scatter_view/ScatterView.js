import FormantView from '../FormantView.js';
import ScatterPlot from '../../../visualization/ScatterPlot.js';
import { formantCount } from '../../../data/FormantProcessor.js';

export default class ScatterView extends FormantView {
    constructor(arg, state) {
        super();
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
            this.divStack.appendChild(this.h2);
            this.initializePlot();
        }
    }

    initializePlot(unit) {
        // move the divStack element to .main-container below the recording container
        let mainContainer = document.querySelector(".main-container");
        mainContainer.appendChild(this.divStack);
        document.querySelector(".recording-container").after(this.divStack);
        // remove everything from div
        while (this.div.firstChild) {
            this.div.removeChild(this.div.firstChild);
        }
        this.scatterPlot = new ScatterPlot("formants", true, unit);
        this.scatterPlot.addSeries([]);
        this.scatterPlot.addSeries([]);
        this.scatterPlot.addSeries([], true, formantCount);
        this.scatterPlot.addSeries([]);
        this.refreshRecording();
    }

    saveFormants(formants) {
        formants.size = 5;
        if (formants.color.length <= 7) formants.color += "80";
        this.scatterPlot.feed(formants, 0);
    }

    vowelCentroid(formants) {
        this.scatterPlot.feed(formants, 1);
    }

    feed(formants, rescale = true) {
        for (let formant of formants) {
            this.scatterPlot.feed(formant, -2, rescale);
        }
    }

    feedSmoothed(formants, rescale = true) {
        this.scatterPlot.setSeriesSingle(formants, -1, 50, rescale);
    }
}
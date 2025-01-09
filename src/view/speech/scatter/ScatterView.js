import SpeechView from '../SpeechView.js';
import ScatterPlot from '../../visualization/scatter_plot/ScatterPlot.js';
import { POINT_SIZES } from '../../../const/POINT_SIZES.js';
import { VOWEL_INVENTORIES } from '../../../const/VOWEL_INVENTORIES.js';
import { createCentroidSelector, createCloudSelector, createEllipseSelector } from "./selectorCreators.js";

export default class ScatterView extends SpeechView {
    representationsSelected = [
        [true, true, true]
    ];

    selectorSetters = [];
    polishCentroidsLocked = false;
    hidePBEllipsesOnUnselect = false;

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

        this.scatterPlot.addSeriesFormatting({ fontWeight: 700, serif: true }, 0);
        this.refreshRecording();
    }

    createSelectorRow(divHTML, letters, colors, serif, style, localGroupId = 0, plotGroupId = 0, cloudOffset = 0) {
        this.selectorSetters.push([]);

        this.#addSelector(
            createCentroidSelector(letters[0], colors[0], serif, this.representationsSelected[localGroupId][2], style),
            localGroupId, plotGroupId, 2
        );

        this.#addSelector(
            createCloudSelector(letters.slice(1), colors.slice(1), cloudOffset, serif, this.representationsSelected[localGroupId][0], style),
            localGroupId, plotGroupId, 0
        );

        this.#addSelector(
            createEllipseSelector(this.representationsSelected[localGroupId][1]),
            localGroupId, plotGroupId, 1
        );

        const div = document.createElement("div");
        div.style = "margin-top: auto; margin-bottom: auto;";
        div.innerHTML = divHTML;
        this.visibleVowelsChoice.appendChild(div);
    }
    
    #addSelector(selector, localGroupId, plotGroupId, subgroupId) {
        const setter = (choice => { 
            selector.fill(choice);
            this.scatterPlot.getGroup(plotGroupId).forEach(group => group[subgroupId].g.style("display", choice ? "block" : "none"));
            this.representationsSelected[localGroupId][subgroupId] = choice;
        }).bind(this);
        this.selectorSetters[this.selectorSetters.length - 1].push(setter);

        const element = selector.element;
        element.addEventListener("click", () => {
            if (localGroupId === 0 && subgroupId === 2 && this.polishCentroidsLocked) return;
            if (localGroupId === 3 && subgroupId === 1) this.hidePBEllipsesOnUnselect = false;
            const choice = !this.representationsSelected[localGroupId][subgroupId];
            setter(choice);
        });
        this.visibleVowelsChoice.appendChild(element);
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

    destroy() {
        super.destroy?.();
        this.scatterPlot.destroy();
    }
}
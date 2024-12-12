import ScatterView from "./ScatterView.js";
import { POINT_SIZES } from '../../../const/POINT_SIZES.js';
import { VOWEL_INVENTORIES } from "../../../const/VOWEL_INVENTORIES.js";
import Vowel from "../../../model/vowels/Vowel.js";
import { append_checkbox, append_h4 } from "../../dom/dom_utils.js";
export default class TrainingView extends ScatterView {
    #datasetAdded = false;
    constructor(controller, arg, recycle = false) {
        super(controller, arg, recycle);
        // iterate through all children of divStack and remove them except h2
        const children = [...this.divStack.children];
        for (let i = 0; i < children.length; i++) {
            if (children[i] !== this.h2) {
                children[i].remove();
            }
        }
        this.h2.innerHTML = `Jesteś teraz w trybie ćwiczenia. 
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
        const buttons = this.divStack.querySelectorAll("button");
        buttons.forEach(button => button.remove());
        const button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.divStack.remove();
        };
        this.divStack.appendChild(button);
        if (recycle) {
            // remove all elements from the div
            while (this.div.firstChild) {
                this.div.removeChild(this.div.firstChild);
            }
            this.initializePlot();
        }
        const nativeVowels = controller.nativeVowels;
        nativeVowels.vowelsProcessed.forEach(vowel => {
            const id = vowel.id;
            vowel.formants.forEach(formant => {
                this.saveFormants(formant, id);
            });
            this.vowelCentroid(vowel);
        });
        this.#addVowelMeasurements(controller.foreignInitial, 1, d3.symbolTriangle);
        this.divStack.style.width = "auto";
    }
    addDatasets(petersonBarney, politicians) {
        if (this.#datasetAdded)
            return;
        this.#addVowelMeasurements(politicians, 1, d3.symbolDiamond);
        this.#addVowelMeasurements(petersonBarney, 1, d3.symbolSquare);
        this.visibleVowelsChoice = document.createElement("div");
        append_h4(this.visibleVowelsChoice, "Język polski:");
        append_checkbox(this.visibleVowelsChoice, "moje samogłoski", (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 0);
        }, true);
        append_h4(this.visibleVowelsChoice, "Język angielski (General American):");
        append_checkbox(this.visibleVowelsChoice, "moje samogłoski", (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 3);
        });
        this.visibleVowelsChoice.appendChild(document.createElement("br"));
        append_checkbox(this.visibleVowelsChoice, "badanie Peterson & Barney, 1952", (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 1);
        });
        this.visibleVowelsChoice.appendChild(document.createElement("br"));
        append_checkbox(this.visibleVowelsChoice, "nagrania polityków", (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 2);
        });
        const sideContainer = document.querySelector(".side-container");
        sideContainer.appendChild(this.visibleVowelsChoice);
        document.querySelector(".recording-container").after(this.visibleVowelsChoice);
        this.#datasetAdded = true;
    }
    #addVowelMeasurements(vowels, index, symbol) {
        if (!symbol)
            throw new Error("Symbol must be provided.");
        if (!index)
            throw new Error("Index must be provided.");
        const vowelInv = VOWEL_INVENTORIES[vowels.language];
        this.scatterPlot.insertGroup({
            formatting: { symbol },
            nested: true
        }, index);
        for (let i = 0; i < vowelInv.length; i++) {
            const vowel = new Vowel(vowelInv[i]);
            const ids = this.scatterPlot.appendGroup({
                nested: true,
                formatting: { rgb: vowel.rgb },
                onClick: this.vowelClicked ? () => this.vowelClicked(vowel) : undefined
            }, index);
            this.scatterPlot.appendGroup({
                formatting: {
                    size: POINT_SIZES.USER_DATAPOINTS * 0.7,
                    opacity: "80",
                }
            }, ids, vowels.getSingleMeasurements(vowel.letter));
            this.scatterPlot.appendGroup({
                formatting: {
                    size: POINT_SIZES.VOWEL_CENTROID * 0.7
                }
            }, ids, vowels.getCentroids(vowel.letter));
        }
        this.scatterPlot.setSeriesVisibility(false, 1);
    }
}

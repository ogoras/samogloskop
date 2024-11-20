import ScatterView from "./ScatterView.js";
import { POINT_SIZES } from '../../../const/POINT_SIZES.js';
import { VOWEL_INVENTORIES } from "../../../const/vowel_inventories/VOWEL_INVENTORIES.js";
import Vowel from "../../../data/vowels/Vowel.js";

export default class TrainingView extends ScatterView {
    constructor(onStateChange, arg, formantProcessor, state) {
        super(onStateChange, arg, state);

        this.h2.innerHTML = `Jesteś teraz w trybie ćwiczenia. 
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;

        let buttons = this.divStack.querySelectorAll("button");
        buttons.forEach(button => button.remove());
        
        let button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.divStack.remove();
        }
        this.divStack.appendChild(button);

        if (state === undefined) {
            // remove all elements from the div
            while (this.div.firstChild) {
                this.div.removeChild(this.div.firstChild);
            }
            this.initializePlot();
        }
        
        let userVowels = formantProcessor.userVowels;
        userVowels.vowelsProcessed.forEach(vowel => {
            let id = vowel.id;
            
            vowel.formants.forEach(formant => {
                this.saveFormants(formant, id);
            });
            this.vowelCentroid(vowel);
        });
    }

    addDataset(vowels) {
        let vowelInv = VOWEL_INVENTORIES[vowels.language];
        this.scatterPlot.insertGroup({ 
            formatting: { symbol: d3.symbolSquare }, 
            nested: true 
        }, 1);
        for (let i = 0; i < vowelInv.length; i++) {
            let vowel = new Vowel(vowelInv[i]);
            let ids = this.scatterPlot.appendGroup({ 
                nested: true, 
                formatting: { rgb: vowel.rgb },
                onClick: this.vowelClicked ? () => this.vowelClicked(vowel) : undefined
            }, 1);
            this.scatterPlot.appendGroup({ formatting: {
                size: POINT_SIZES.USER_DATAPOINTS * 0.7,
                opacity: "80",
            }}, ids, vowels.getSingleMeasurements(vowel.letter));
            this.scatterPlot.appendGroup({ formatting: {
                size: POINT_SIZES.VOWEL_CENTROID * 0.7
            }}, ids, vowels.getCentroids(vowel.letter));
        }
        this.scatterPlot.setSeriesVisibility(false, 1);
        this.visibleVowelsChoice = document.createElement("div");
        this.visibleVowelsChoice.innerHTML = 
            `<h3>Pokaż:</h3>
            <input type="checkbox" id="user-vowels" checked> moje samogłoski<br>
            <input type="checkbox" id="peterson-barney"> samogłoski angielskie
            <text class=gray>(General American, Peterson & Barney, 1952)</p>`;
        this.visibleVowelsChoice.querySelector("#user-vowels").onchange = (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 0);
        }
        this.visibleVowelsChoice.querySelector("#peterson-barney").onchange = (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 1);
        }
        let sideContainer = document.querySelector(".side-container");
        sideContainer.appendChild(this.visibleVowelsChoice);
        document.querySelector(".recording-container").after(this.visibleVowelsChoice);
    }
}
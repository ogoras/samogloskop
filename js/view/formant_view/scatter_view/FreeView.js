import ScatterView from "./ScatterView.js";
import STATES from "../../../const/states.js";

export default class FreeView extends ScatterView {
    constructor(arg, formantProcessor, state) {
        super(arg, state);

        this.h2.innerHTML = (state === undefined
            ? `Kalibracja ukończona!`
            : `Wczytano dane kalibracji z poprzedniej sesji.`)
            + `<br>
                Jesteś teraz w trybie swobodnego mówienia. 
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
        
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
            for (let vowel of userVowels.vowelsProcessed) {
                for (let formant of vowel.formants) {
                    this.saveFormants(formant);
                }
                this.vowelCentroid(vowel.avg);
            }
    }

    addDataset(vowels) {
        this.scatterPlot.insertSeries(vowels.singleMeasurements, 2);
        this.scatterPlot.insertSeries(vowels.centroids, 3);
        this.scatterPlot.setSeriesVisibility(false, 2, 3);
        this.visibleVowelsChoice = document.createElement("div");
        this.visibleVowelsChoice.innerHTML = 
            `<h3>Pokaż:</h3>
            moje samogłoski <input type="checkbox" id="user-vowels" checked><br>
            samogłoski angielskie <input type="checkbox" id="peterson-barney">
            <text class=gray>(General American, Peterson & Barney, 1952)</p>`;
        this.visibleVowelsChoice.querySelector("#user-vowels").onchange = (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 0, 1);
        }
        this.visibleVowelsChoice.querySelector("#peterson-barney").onchange = (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 2, 3);
        }
        let mainContainer = document.querySelector(".main-container");
        mainContainer.appendChild(this.visibleVowelsChoice);
        mainContainer.insertBefore(this.visibleVowelsChoice, document.querySelector("canvas"));
    }
}
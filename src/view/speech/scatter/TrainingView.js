import ScatterView from "./ScatterView.js";
import { POINT_SIZES } from '../../../const/POINT_SIZES.js';
import { VOWEL_INVENTORIES } from "../../../const/VOWEL_INVENTORIES.js";
import Vowel from "../../../model/vowels/Vowel.js";
import { append_h } from "../../dom/dom_utils.js";
import nullish from "../../../logic/util/nullish.js";

export default class TrainingView extends ScatterView {
    #datasetAdded = false;
    #currentMessage = 0;

    #datasetCount = 1;
    representationsSelected = [
        [false, false, false],
        [false, false, true],
        [false, false, false],
        [false, true, false]
    ]

    constructor(controller, arg, recycle = false, parent) {
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
        this.divStack.appendChild(this.h2);

        const buttons = this.divStack.querySelectorAll("button");
        buttons.forEach(button => button.remove());
        
        const button = this.button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.nextMessage();
        }
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
            this.vowelEllipse(vowel.confidenceEllipse, id);
        });

        this.#addVowelMeasurements(controller.foreignInitial, 1, d3.symbolTriangle, {
            pointOpacity: "FF",
            ellipseOpacity0: 0.8,
            ellipseOpacity1: 0
        }, { italic: true })

        this.divStack.style.width = "auto";

        const sideContainer = this.sideContainer = parent.sideContainer;
        const moreInfo = parent.moreInfo;

        this.timer = {
            element: document.createElement("span"),
            visible: false,
            setTime: function(time) {
                this.time = time;
                function twoDigits(num) { return num.toString().padStart(2, '0'); }
                const hh = Math.floor(time / 3600);
                const mm = twoDigits(Math.floor(time / 60) % 60);
                const ss = twoDigits(time % 60);
                this.element.innerHTML = `Ćwiczysz już: ${hh}:${mm}:${ss}`;
            },
            show: function(timeMs) {
                this.visible = true;
                sideContainer.insertBefore(this.element, moreInfo.div);
                if (!nullish(timeMs)) this.setTime(Math.floor(timeMs / 1000));
            },
            resume: function() {
                if (!this.visible) throw new Error("Tried to resume timer when it's not visible");
                if (this.interval) throw new Error("Timer already running");
                this.interval = setInterval(() => this.setTime(this.time + 1), 1000);
            },
            pauseAndUpdate: function(timeMs) {
                if (!this.visible) throw new Error("Tried to pause and update timer when it's not visible");
                if (!this.interval) throw new Error("Timer not running");
                clearInterval(this.interval);
                this.interval = null;
                this.setTime(Math.floor(timeMs / 1000));
            },
            hide: function() {
                if (!this.visible) throw new Error("Tried to remove timer when it's not visible");
                if (this.interval) clearInterval(this.interval);
                this.element.remove();
                this.visible = false;
            }
        };
        this.timer.element.classList.add("timer");
    }

    addDatasets(petersonBarney, politicians) {
        if (this.#datasetAdded) return;

        this.scatterPlot.getGroup(0).forEach(group => group.forEach((subgroup, index) => subgroup.g.style("display", this.representationsSelected[0][index] ? "block" : "none")));

        this.#addVowelMeasurements(politicians, 1, d3.symbolDiamond, {
            pointOpacity: "80",
            ellipseOpacity0: 0.2,
            ellipseOpacity1: 0.2
        });

        this.#addVowelMeasurements(petersonBarney, 1, d3.symbolSquare, {
            pointOpacity: "A0",
            ellipseOpacity0: 0.4,
            ellipseOpacity1: 0.4
        }, { fontWeight: 700 });

        this.visibleVowelsChoice = document.createElement("div"); // HTML grid with 3 columns
        this.visibleVowelsChoice.style = "display: grid; grid-template-columns: 30px 30px 30px auto; gap: 0px";

        let h = append_h(this.visibleVowelsChoice, "<text class=serif>Język polski:</text>", 3);
        h.style = "grid-column-start: 1; grid-column-end: 5;";

        this.createSelectorRow(
            "<text class=serif>moje samogłoski</text>",
            ["e", "a", "o", "y"],
            ["#faa500", "#ff0000", "#ff00ff", "#964b00"],
            true, "font-weight: 700", 0, 0, 0
        )
    
        h = append_h(this.visibleVowelsChoice, "Język angielski (General American):", 3);
        h.style = "grid-column-start: 1; grid-column-end: 5;";

        const englishLetters = ["ɛ", "ɑ", "ɔ", "ɪ"];
        const englishColors = ["#d09800", "#ff0060", "#ff00ff", "#006000"];

        this.createSelectorRow(
            "<i>moje samogłoski</i>",
            englishLetters, englishColors,
            false, "font-style: italic", 1, 3, -2
        );

        this.createSelectorRow(
            "<b>badanie Peterson & Barney, 1952</b>",
            englishLetters, englishColors,
            false, "font-weight: 700", 3, 1, -2
        );

        this.createSelectorRow(
            "nagrania polityków",
            englishLetters, englishColors,
            false, null, 2, 2, -2
        );

        this.sideContainer.appendChild(this.visibleVowelsChoice);
        document.querySelector(".recording-container").after(this.visibleVowelsChoice);

        this.#datasetAdded = true;
    }

    #addVowelMeasurements(vowels, index, symbol, {pointOpacity = "80", ellipseOpacity0, ellipseOpacity1}, formatting = {}) {
        if (!symbol) throw new Error("Symbol must be provided.");
        if (!index) throw new Error("Index must be provided.");
        const vowelInv = VOWEL_INVENTORIES[vowels.language];
        this.scatterPlot.insertGroup({
            formatting: { symbol, ...formatting },
            nested: true
        }, index);
        for (let i = 0; i < vowelInv.length; i++) {
            const vowel = vowels.getVowelByLetter(new Vowel(vowelInv[i]).letter);
            const ids = this.scatterPlot.appendGroup({
                nested: true,
                formatting: { rgb: vowel.rgb },
                onClick: this.vowelClicked ? () => this.vowelClicked(vowel) : undefined
            }, index);
            
            const pointCloudIds = this.scatterPlot.appendGroup({
                formatting: {
                    size: POINT_SIZES.USER_DATAPOINTS * 0.7,
                    text: vowel.letter,
                    opacity: pointOpacity,
                }
            }, ids, vowels.getSingleMeasurements(vowel.letter));

            this.scatterPlot.setSeriesVisibility(this.representationsSelected[this.#datasetCount][0], pointCloudIds);

            const ellipseIds = this.scatterPlot.appendGroup({}, ids);
            this.scatterPlot.addEllipse({
                ...vowel.confidenceEllipse,
                ellipseOpacity0,
                ellipseOpacity1
            }, ellipseIds);
            
            this.scatterPlot.setSeriesVisibility(this.representationsSelected[this.#datasetCount][1], ellipseIds);

            const centroidIds = this.scatterPlot.appendGroup({
                formatting: {
                    size: POINT_SIZES.VOWEL_CENTROID * 0.7,
                    text: vowel.letter,
                    glow: true
                }
            }, ids, vowels.getCentroids(vowel.letter));

            this.scatterPlot.setSeriesVisibility(this.representationsSelected[this.#datasetCount][2], centroidIds);
        }
        this.#datasetCount++
    }

    nextMessage() {
        if (this.#currentMessage == 0) {
            this.h2.innerHTML = `W dowolnym momencie, jeśli czujesz, że lepiej już wymawiasz te samogłoski, możesz przejść dalej do testu końcowego.`;
            this.button.innerHTML = "Przejdź dalej";
            this.#currentMessage++;
        } else if (this.#currentMessage == 1) {
            if (confirm("Czy na pewno chcesz przejść do testu końcowego? Nie będzie można już wrócić do ćwiczenia.")) {
                this.controller.next();
            }
        }
    }

    destroy() {
        this.button.remove();
        this.visibleVowelsChoice?.remove();
        this.divStack.style = "";
    }
}
import Component from "../Component.js";
import CentroidSelectorComponent from "./CentroidSelectorComponent.js";
import CloudSelectorComponent from "./CloudSelectorComponent.js";
import EllipseSelectorComponent from "./EllipseSelectorComponent.js";
import { append_h } from "../../dom_utils.js";

export default class SelectorsComponent extends Component {
    polishCentroidsLocked = false;
    hidePBEllipsesOnUnselect = false;
    selectors = [];
    
    constructor(parent, plotComponent, nativeOnly, twoUserForeignDatasets) {
        super(null, null, parent);
        this.plotComponent = plotComponent;
        this.nativeOnly = nativeOnly;

        this.element.style = "display: grid; grid-template-columns: 30px 30px 30px auto; gap: 0px";

        if (nativeOnly) {
            this.#createSelectorRow(
                ` <b>←</b> <text class="serif gray">wybór reprezentacji</text>`,
                ["e", "a", "o", "y"],
                ["#faa500", "#ff0000", "#ff00ff", "#964b00"],
                true
            )
        } else {
            let h = append_h(this, "<text class=serif>Język polski:</text>", 3);
            h.style = "grid-column-start: 1; grid-column-end: 5;";

            this.#createSelectorRow(
                "<text class=serif>moje samogłoski</text>",
                ["e", "a", "o", "y"],
                ["#faa500", "#ff0000", "#ff00ff", "#964b00"],
                true, null, 0, 0, 0, this.view?.representationsSelected[0]
            )
        
            h = append_h(this, "Język angielski (General American):", 3);
            h.style = "grid-column-start: 1; grid-column-end: 5;";

            const englishLetters = ["ɛ", "ɑ", "ɔ", "ɪ"];
            const englishColors = ["#d09800", "#ff0060", "#ff00ff", "#006000"];

            let myVowelsDivContents;
            if (twoUserForeignDatasets) {
                this.showForeignInitialInsteadOfCurrent = false;

                const flexbox = document.createElement("div");
                flexbox.style = "display: flex; align-items: center; justify-content: left; gap: 0.5rem;";

                const myVowelsText = document.createElement("i");
                myVowelsText.innerHTML = "moje samogłoski";
                flexbox.appendChild(myVowelsText);

                const button = document.createElement("button");
                button.classList.add("button", "tiny");
                button.innerHTML = "pokaż stare";
                button.onclick = () => {
                    this.showForeignInitialInsteadOfCurrent = !this.showForeignInitialInsteadOfCurrent;
                    button.innerHTML = this.showForeignInitialInsteadOfCurrent ? "pokaż nowe" : "pokaż stare";
                    // plotGroupId = 3 NOWE
                    // plotGroupId = 4 STARE
                    for (const selector of this.selectors[1]) {
                        // cache selection state
                        const selected = selector.selected;
                        // deselect to hide the old dataset
                        selector.selected = false;
                        // select the new dataset
                        selector.plotGroupId = this.showForeignInitialInsteadOfCurrent ? 4 : 3;
                        // restore selection state
                        selector.selected = selected;
                    }
                }
                flexbox.appendChild(button);

                myVowelsDivContents = flexbox;
            } else {
                myVowelsDivContents = "<i>moje samogłoski</i>";
            }

            this.#createSelectorRow(
                myVowelsDivContents,
                englishLetters, englishColors,
                false, "font-style: italic", 1, 3, -2, this.view?.representationsSelected[1]
            );

            this.#createSelectorRow(
                "<b>badanie Peterson & Barney, 1952</b>",
                englishLetters, englishColors,
                false, "font-weight: 700", 3, 1, -2, this.view?.representationsSelected[3]
            );

            this.#createSelectorRow(
                "nagrania polityków",
                englishLetters, englishColors,
                false, null, 2, 2, -2, this.view?.representationsSelected[2]
            );
        }
    }

    #createSelectorRow(divContents, letters, colors, serif, style, localGroupId = 0, plotGroupId = 0, cloudOffset = 0, initiallySelected) {
        const selectorsInRow = [];
        
        selectorsInRow.push(new CentroidSelectorComponent(this, plotGroupId, 2, initiallySelected?.[2] ?? true, localGroupId == 0 ? () => { return this.polishCentroidsLocked } : undefined, undefined, letters[0], colors[0], serif, style));

        selectorsInRow.push(new CloudSelectorComponent(this, plotGroupId, 0, initiallySelected?.[0] ?? true, undefined, undefined, letters.slice(1), colors.slice(1), cloudOffset, serif, style));

        selectorsInRow.push(new EllipseSelectorComponent(this, plotGroupId, 1, initiallySelected?.[1] ?? true, undefined, localGroupId == 3));

        this.selectors.push(selectorsInRow);


        const div = document.createElement("div");
        div.style = "margin-top: auto; margin-bottom: auto;";

        if (typeof divContents === "string") {
            div.innerHTML = divContents;
        } else if (divContents instanceof HTMLElement) {
            div.appendChild(divContents);
        } else {
            throw new Error("Invalid divContents type. Expected string or HTMLElement.");
        }

        this.appendChild(div);
    }
}
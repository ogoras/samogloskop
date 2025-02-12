import RecordingView from '../recording/RecordingView.js';
import { append_h } from "../../dom_utils.js";
import Timer from "../../components/training/Timer.js";
import SelectedVowelDisplay from "../../components/training/SelectedVowelDisplay.js";
import PlotComponent from '../../components/PlotComponent.js';

export default class TestGroupView extends RecordingView {
    #initialized = false;
    #datasetAdded = false;
    #currentMessage = 0;
    #selectedVowelId = null;
    #werePolishCentroidsVisible = false;
    hidePBEllipsesOnUnselect = false;

    representationsSelected = [
        [false, false, false],
        [false, false, true],
        [false, false, false],
        [false, true, false]
    ]

    constructor(controller, recorder, prev) {
        super(controller, recorder, prev, true);

        if (prev?.stackComponent?.h2) {
            this.stackComponent.removeAllExceptH2();
        } else {
            this.stackComponent.clear();
            this.stackComponent.addH2();
        }

        this.stackComponent.h2.innerHTML = `Jesteś teraz w trybie ćwiczenia. 
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
        
        const button = this.button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.nextMessage();
        }
        this.stackComponent.appendChild(button);

        this.formantsComponent.clear();
        this.plotComponent = new PlotComponent(this, this.controller.formantCount);
        
        const nativeVowels = controller.nativeVowels;
        nativeVowels.vowelsProcessed.forEach(vowel => {
            const id = vowel.id;
            
            vowel.formants.forEach(formant => {
                this.plotComponent.saveFormants(formant, id);
            });
            this.plotComponent.vowelCentroid(vowel);
            this.plotComponent.vowelEllipse(vowel.confidenceEllipse, id);
        });

        this.plotComponent.addVowelMeasurements(controller.foreignInitial, 1, d3.symbolTriangle, {
            pointOpacity: "FF",
            ellipseOpacity0: 0.8,
            ellipseOpacity1: 0
        }, this.representationsSelected[1], { italic: true })

        this.stackComponent.element.style.width = "auto";

        this.timer = new Timer(this.sideComponent, this.sideComponent.moreInfo);

        this.plotComponent.disableNativeClickability();

        this.selectedVowelDisplay = new SelectedVowelDisplay(controller, this.sideComponent, this.sideComponent.recordingComponent);

        this.#initialized = true;
    }

    addDatasets(petersonBarney, politicianRecordings) {
        if (this.#datasetAdded) return;

        this.plotComponent.setNativeVowelsVisiblity(this.representationsSelected[0]);

        this.plotComponent.addVowelMeasurements(politicianRecordings.combinedVowels, 1, d3.symbolDiamond, {
            pointOpacity: "80",
            ellipseOpacity0: 0.2,
            ellipseOpacity1: 0.2
        }, this.representationsSelected[2]);

        this.plotComponent.addVowelMeasurements(petersonBarney, 1, d3.symbolSquare, {
            pointOpacity: "A0",
            ellipseOpacity0: 0.4,
            ellipseOpacity1: 0.4
        }, this.representationsSelected[3], { fontWeight: 700 });

        this.visibleVowelsChoice = document.createElement("div"); // HTML grid with 3 columns
        this.visibleVowelsChoice.style = "display: grid; grid-template-columns: 30px 30px 30px auto; gap: 0px";

        let h = append_h(this.visibleVowelsChoice, "<text class=serif>Język polski:</text>", 3);
        h.style = "grid-column-start: 1; grid-column-end: 5;";

        this.createSelectorRow(
            "<text class=serif>moje samogłoski</text>",
            ["e", "a", "o", "y"],
            ["#faa500", "#ff0000", "#ff00ff", "#964b00"],
            true, null, 0, 0, 0
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
        this.selectedVowelDisplay.element.after(this.visibleVowelsChoice);

        this.#datasetAdded = true;
    }

    addWords(words) {
        this.selectedVowelDisplay.addWords(words);
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
        super.destroy();
        
        this.button.remove();
        this.visibleVowelsChoice?.remove();
        this.stackComponent.style = "";
    }

    vowelClicked(vowel) {
        if (!this.#datasetAdded || !this.#initialized) return;
        if (vowel.language === "PL") return;

        const newSelectedId = vowel.id;

        if (newSelectedId === this.#selectedVowelId) {
            this.#selectedVowelId = null;
            this.selectedVowelDisplay.deselectVowel();
            this.stackComponent.style.display = null; // reset to default

            for (let i = 1; i <= 3; i++) {
                this.scatterPlot.getGroup(i).forEach((group, index) => {
                    if (index === newSelectedId) return;
                    group.g.style("display", "block")
                });
            }
            this.selectorSetters[0][0](this.#werePolishCentroidsVisible);
            this.polishCentroidsLocked = false;

            if (this.hidePBEllipsesOnUnselect) {
                this.selectorSetters[2][2](false);
                this.hidePBEllipsesOnUnselect = null;
            }
            return;
        }

        this.stackComponent.style.display = "none";
        this.selectedVowelDisplay.selectVowel(vowel);

        for (let i = 1; i <= 3; i++) {
            this.scatterPlot.getGroup(i).forEach((group, index) => {
                if (index === newSelectedId) return;
                group.g.style("display", "none")
            });
        }
        this.#werePolishCentroidsVisible = this.representationsSelected[0][2];
        this.selectorSetters[0][0](true);
        this.polishCentroidsLocked = true;
        
        this.hidePBEllipsesOnUnselect = false;
        if (this.representationsSelected[3].every(value => !value)) {
            this.hidePBEllipsesOnUnselect = true;
            this.selectorSetters[2][2](true);
        }
        
        this.#selectedVowelId = newSelectedId;
    }
}
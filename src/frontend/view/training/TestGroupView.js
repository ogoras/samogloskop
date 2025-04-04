import RecordingView from '../recording/RecordingView.js';
import Timer from "../../components/training/Timer.js";
import SelectedVowelDisplay from "../../components/training/SelectedVowelDisplay.js";
import PlotComponent from '../../components/PlotComponent.js';

export default class TestGroupView extends RecordingView {
    #initialized = false;
    #datasetAdded = false;
    #currentMessage = 0;
    #selectedVowelId = null;
    #werePolishCentroidsVisible = false;

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

        this.sideComponent.recordingComponent.after(this.stackComponent);

        this.stackComponent.h2.innerHTML = `Jesteś teraz w trybie ćwiczenia. 
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
        
        const button = this.button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.nextMessage();
        }
        this.stackComponent.appendChild(button);

        this.formantsComponent.clear();
        const twoUserForeignDatasets = this.twoUserForeignDatasets = controller.foreignCurrent?.isDone();
        this.plotComponent = new PlotComponent(this, this.controller.formantCount, null, twoUserForeignDatasets);
        
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
        }, twoUserForeignDatasets ? [false, false, false] : this.representationsSelected[1], { italic: true })

        if (twoUserForeignDatasets) {
            this.plotComponent.addVowelMeasurements(controller.foreignCurrent, 1, d3.symbolTriangle, {
                pointOpacity: "FF",
                ellipseOpacity0: 0.8,
                ellipseOpacity1: 0
            }, this.representationsSelected[1], { italic: true })
        }

        this.stackComponent.element.style.width = "auto";

        this.timer = new Timer(this.sideComponent);

        this.plotComponent.disableNativeClickability();

        this.selectedVowelDisplay = new SelectedVowelDisplay(this, controller, this.sideComponent, this.sideComponent.recordingComponent);

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

        this.sideComponent.createVowelSelectors(this.plotComponent, false, this.twoUserForeignDatasets);
        this.sideComponent.recordingComponent.after(this.selectedVowelDisplay.element);

        this.#datasetAdded = true;
    }

    addWords(words) {
        this.selectedVowelDisplay.addWords(words);
    }

    nextMessage() {
        if (this.#currentMessage == 0) {
            this.stackComponent.h2.innerHTML = `W dowolnym momencie, jeśli czujesz, że lepiej już wymawiasz te samogłoski, możesz przejść dalej do testu końcowego.`;
            this.button.innerHTML = "Przejdź do testu końcowego";
            
            if (!this.controller.trainedLongEnough) {
                this.stackComponent.hidden = true;
            }
            this.#currentMessage++;
        } else if (this.#currentMessage == 1) {
            if (confirm("Czy na pewno chcesz przejść do testu końcowego? Nie będzie można już wrócić do ćwiczenia.")) {
                this.controller.next();
            }
        }
    }

    reset() {
        this.button.remove();
        this.selectedVowelDisplay.element.remove();
        this.stackComponent.element.style = null;
    }

    vowelClicked(vowel) {
        if (!this.#datasetAdded || !this.#initialized) return;
        if (vowel.language === "PL") return;

        const newSelectedId = vowel.id;

        if (newSelectedId === this.#selectedVowelId) {
            this.#selectedVowelId = null;
            this.selectedVowelDisplay.deselectVowel();
            if (this.#currentMessage != 1 || this.controller.trainedLongEnough) this.stackComponent.hidden = false;

            this.plotComponent.showAllForeign();
            
            this.sideComponent.selectorsComponent.selectors[0][0].selected = this.#werePolishCentroidsVisible;
            this.sideComponent.selectorsComponent.polishCentroidsLocked = false;

            if (this.sideComponent.selectorsComponent.hidePBEllipsesOnUnselect) {
                this.sideComponent.selectorsComponent.selectors[2][2].selected = false;
                this.sideComponent.selectorsComponent.hidePBEllipsesOnUnselect = null;
            }
            return;
        }

        this.stackComponent.hidden = true;
        this.selectedVowelDisplay.selectVowel(vowel);
        this.plotComponent.selectForeignVowel(newSelectedId);

        this.#werePolishCentroidsVisible = this.sideComponent.selectorsComponent.selectors[0][0].selected;
        this.sideComponent.selectorsComponent.selectors[0][0].selected = true;
        this.sideComponent.selectorsComponent.polishCentroidsLocked = true;
        
        this.sideComponent.selectorsComponent.hidePBEllipsesOnUnselect = false;
        if (this.sideComponent.selectorsComponent.selectors[2].every(selector => !selector.selected)) {
            this.sideComponent.selectorsComponent.hidePBEllipsesOnUnselect = true;
            this.sideComponent.selectorsComponent.selectors[2][2].selected = true;
        }
        
        this.#selectedVowelId = newSelectedId;
    }

    feedFormants(formants) {
        this.assertSpeechFormants?.();
        this.plotComponent?.feed(formants, false);
    }

    feedSmoothed(formants) {
        if (!formants) return;
        this.assertSpeechFormants?.();
        this.plotComponent?.feedSmoothed(formants, false);
    }

    notifyDailyTargetReached() {
        // show message
        window.alert("Wystarczy na dzisiaj! Możesz zamknąć stronę i wrócić jutro.");
    }
}
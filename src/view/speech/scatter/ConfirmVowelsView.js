import ScatterView from './ScatterView.js';
import getState from '../../../const/State.js';
import { VOWEL_INVENTORIES, VOWEL_DICTS } from '../../../const/VOWEL_INVENTORIES.js';

export default class ConfirmVowelsView extends ScatterView {
    static viewedAtLeastOnce = false;
    currentMessage = 0;
    editingVowel = false;

    constructor(controller, arg, recycle = false) {
        super(controller, arg, recycle);

        this.h2.innerHTML = (recycle
            ? `Kalibracja ukończona!`
            : `Wczytano dane kalibracji z poprzedniej sesji.`)
            + `<br>Możesz teraz swobodnie mówić i zobaczyć, 
                czy Twoje samogłoski są zgodne z danymi kalibracji.
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
        
        const button = this.button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.nextMessage();
        }
        this.divStack.appendChild(button);

        if (ConfirmVowelsView.viewedAtLeastOnce) this.nextMessage();

        if (recycle) {
            this.initializePlot();
        }
        
        const nativeVowels = this.nativeVowels = controller.nativeVowels;
        nativeVowels.vowelsProcessed.forEach(vowel => {
            const id = vowel.id;
            
            vowel.formants.forEach(formant => {
                this.saveFormants(formant, id);
            });
            this.vowelCentroid(vowel);
        });

        ConfirmVowelsView.viewedAtLeastOnce = true;
    }

    nextMessage() {
        switch(++this.currentMessage) {
            case 1:
                this.h2.innerHTML = `Naciśnij na reprezentację samogłoski na wykresie, żeby poprawić jej pozycję. 
                    Jeśli uważasz, że wszystko się zgadza, możesz od razu przejść do kolejnego kroku.`;
                this.divStack.querySelector("button").innerHTML = "Zatwierdź zebrane samogłoski";
                break;
            case 2:
                this.button.remove();
                // this.onStateChange({ newState: getState("INITIAL_FOREIGN"), disableMic: true }, false);
                this.controller.confirm();
                break;
        }
    }

    vowelClicked(vowel) {
        if (this.editingVowel) return;
        this.editingVowel = true;
        this.controller.editVowel(vowel);
        const vowelInv = VOWEL_INVENTORIES.PL;
        const vowelDict = VOWEL_DICTS.PL;
        this.scatterPlot.removePointsFromGroup([0, vowelDict[vowel.letter]]);
        for (let i = 0; i < vowelInv.length; i++) {
            this.scatterPlot.setGroupClickability(false, [0, i]);
        }
    }
}
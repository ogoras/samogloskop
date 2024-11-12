import ScatterView from './ScatterView.js';
import { STATES } from '../../../const/states.js';
import { VOWEL_INVENTORIES, VOWEL_DICTS } from '../../../const/vowel_inventories/VOWEL_INVENTORIES.js';

export default class ConfirmVowelsView extends ScatterView {
    static viewedAtLeastOnce = false;
    currentMessage = 0;
    editingVowel = false;

    constructor(onStateChange, arg, formantProcessor, state) {
        super(onStateChange, arg, state);
        this.formantProcessor = formantProcessor;

        this.h2.innerHTML = (state === undefined
            ? `Kalibracja ukończona!`
            : `Wczytano dane kalibracji z poprzedniej sesji.`)
            + `<br>Możesz teraz swobodnie mówić i zobaczyć, 
                czy Twoje samogłoski są zgodne z danymi kalibracji.
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
        
        let button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.nextMessage();
        }
        this.divStack.appendChild(button);

        if (ConfirmVowelsView.viewedAtLeastOnce) this.nextMessage();

        if (state === undefined) {
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
                this.onStateChange({newState: STATES.TRAINING}, false);
                break;
        }
    }

    vowelClicked(vowel) {
        if (this.editingVowel) return;
        this.editingVowel = true;
        this.formantProcessor.userVowels.resetVowel(vowel);
        this.onStateChange({tempState: STATES.WAITING_FOR_VOWELS}, false);
        let vowelInv = VOWEL_INVENTORIES.PL;
        let vowelDict = VOWEL_DICTS.PL;
        this.scatterPlot.removePointsFromGroup(vowelDict[vowel.letter]);
        for (let i = 0; i < vowelInv.length; i++) {
            this.scatterPlot.setGroupClickability(false, i);
        }
    }
}
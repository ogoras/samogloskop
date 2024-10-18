import { ScatterView } from "./ScatterView.js";
import { STATES } from "../../../definitions/states.js";

export class FreeView extends ScatterView {
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

        if (state === STATES.DONE) {
            let userVowels = formantProcessor.userVowels;
            for (let phoneme of userVowels.phonemesProcessed) {
                for (let formant of phoneme.formants) {
                    this.saveFormants(formant);
                }
                this.vowelCentroid(phoneme.avg);
            }
        }
    }
}
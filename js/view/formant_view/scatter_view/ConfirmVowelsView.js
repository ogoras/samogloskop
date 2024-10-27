import ScatterView from './ScatterView.js';

export default class ConfirmVowelsView extends ScatterView {
    constructor(arg, formantProcessor, state) {
        super(arg, state);

        this.h2.innerHTML = (state === undefined
            ? `Kalibracja ukończona!`
            : `Wczytano dane kalibracji z poprzedniej sesji.`)
            + `<br>Możesz teraz swobodnie mówić i zobaczyć, 
                czy Twoje samogłoski są zgodne z danymi kalibracji.
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
        
        let button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.divStack.remove();
        }
        this.divStack.appendChild(button);

        if (state === undefined) {
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
}
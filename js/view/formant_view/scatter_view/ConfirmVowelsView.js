import ScatterView from './ScatterView.js';

export default class ConfirmVowelsView extends ScatterView {
    currentMessage = 0;

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
            this.nextMessage();
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

    nextMessage() {
        switch(++this.currentMessage) {
            case 1:
                this.h2.innerHTML = `Naciśnij na reprezentację samogłoski na wykresie, żeby poprawić jej pozycję. 
                    Jeśli uważasz, że wszystko się zgadza, możesz od razu przejść do kolejnego kroku.`;
                this.divStack.querySelector("button").innerHTML = "Przejdź dalej";
                break;
            case 2:
                this.h2.innerHTML = `Niestety, następny krok jeszcze nie jest gotowy :(`
                this.divStack.querySelector("button").remove();
                // TODO: implement callback to parent
                break;
        }
    }
}
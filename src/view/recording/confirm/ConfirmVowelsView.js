import RecordingView from '../RecordingView.js';

export default class ConfirmVowelsView extends RecordingView {
    static viewedAtLeastOnce = false;
    currentMessage = 0;
    editingVowel = false;

    constructor(controller, recorder, prev) {
        super(controller, recorder, prev, true);

        if (!this.stackComponent.h2) {
            this.stackComponent.addH2();
        }

        this.stackComponent.h2.innerHTML = (prev
            ? `Kalibracja ukończona!`
            : `Wczytano dane kalibracji z poprzedniej sesji.`)
            + `<br>Możesz teraz swobodnie mówić i zobaczyć, 
                czy Twoje samogłoski są zgodne z danymi kalibracji.
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
    }
}
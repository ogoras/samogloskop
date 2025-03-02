import RecordingView from '../RecordingView.js';
import PlotComponent from '../../../components/PlotComponent.js';
import StackComponent from '../../../components/stack/StackComponent.js';

export default class ConfirmVowelsView extends RecordingView {
    static viewedAtLeastOnce = false;
    currentMessage = 0;
    editingVowel = false;

    constructor(controller, recorder, prev) {
        super(controller, recorder, prev, true);

        this.sideComponent.recordingComponent.after(this.stackComponent);

        if (!this.stackComponent.h2) {
            this.stackComponent.clear();
            this.stackComponent.addH2();
        } else {
            this.stackComponent.removeAllExceptH2();
        }

        this.stackComponent.h2.innerHTML = (prev
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
        this.stackComponent.appendChild(button);

        if (ConfirmVowelsView.viewedAtLeastOnce) this.nextMessage();

        this.formantsComponent.clear();
        this.plotComponent = new PlotComponent(this, this.controller.formantCount);
        
        const nativeVowels = this.nativeVowels = controller.nativeVowels;
        nativeVowels.vowelsProcessed.forEach(vowel => {
            const id = vowel.id;
            
            vowel.formants.forEach(formant => {
                this.plotComponent.saveFormants(formant, id);
            });
            this.plotComponent.vowelCentroid(vowel);
            this.plotComponent.vowelEllipse(vowel.confidenceEllipse, id);
        });

        ConfirmVowelsView.viewedAtLeastOnce = true;

        this.sideComponent.createVowelSelectors(this.plotComponent, true);
    }

    nextMessage() {
        switch(this.currentMessage) {
            case 0:
                this.stackComponent.h2.innerHTML = `Naciśnij na reprezentację samogłoski na wykresie, żeby poprawić jej pozycję. 
                    Jeśli uważasz, że wszystko się zgadza, możesz od razu przejść do kolejnego kroku.`;
                this.button.innerHTML = "Zatwierdź zebrane samogłoski";
                this.currentMessage++;
                break;
            case 1:
                if (confirm("Czy na pewno chcesz zatwierdzić zebrane samogłoski? Nie będzie można ich później edytować.")) {
                    this.button.remove();
                    this.controller.confirm();
                }
                break;
        }
    }

    vowelClicked(vowel) {
        if (this.editingVowel) return;
        this.editingVowel = true;
        this.controller.editVowel(vowel);
        this.plotComponent.removeNativeVowel(vowel);
        this.plotComponent.disableNativeClickability();
    }
}
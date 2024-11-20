import SpeechView from "./SpeechView.js";

export default class GatheringForeignView extends SpeechView {
    constructor(onStateChange, view, formantProcessor) {
        super(onStateChange, view);

        this.div = view.div;
        this.divStack = view.divStack;
        this.h2 = view.h2;
        this.formantProcessor = formantProcessor;

        this.h2.innerHTML = `Teraz sprawdzimy Twoją umiejętność mówienia po angielsku z wymową amerykańską. Poproszę Cię o odsłuchanie nagrania, a następnie nagranie swojej próby wypowiedzenia usłyszanej samogłoski. Zrobimy tak dla wszystkich samogłosek występujących w dialekcie General American.`;

        this.div.innerHTML = "";
        let centerDiv = document.createElement("div");
        centerDiv.classList.add("center");
        this.div.appendChild(centerDiv);
        centerDiv.appendChild(this.divStack);

        let button = this.button = document.createElement("button");
        button.innerHTML = "Przejdź do pierwszego nagrania";
        button.onclick = () => this.showFirstRecording();
        this.divStack.appendChild(button);
    }

    showFirstRecording() {
        console.log("showFirstRecording");
        this.h2.innerHTML = "Wysłuchaj nagrania, w momencie gotowości włącz mikrofon i powtórz samogłoskę.";

        this.button.remove();
        this.onStateChange({ disableMic: false }, false);
    }
}
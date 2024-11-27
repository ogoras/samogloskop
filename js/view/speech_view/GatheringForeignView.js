import SpeechView from "./SpeechView.js";

export default class GatheringForeignView extends SpeechView {
    initialized = false;

    constructor(onStateChange, view) {
        super(onStateChange, view);

        this.div = view.div;
        this.divStack = view.divStack;
        this.h2 = view.h2;

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

        this.userVowels = null; // TODO set this
    }

    initializeRecordings(foreignRecordings) {
        this.foreignRecordings = foreignRecordings;
        this.initialized = true;
    }

    showFirstRecording() {
        if (!this.initialized) {
            console.log("Unfortunately, the recordings have not been initialized yet.");
            return;
        }
        this.h2.innerHTML = "Wysłuchaj nagrania, w momencie gotowości włącz mikrofon i powtórz samogłoskę.";

        this.button.remove();

        let vowel = this.userVowels.nextVowel();
        let recording = this.foreignRecordings.getRandomEntryForVowel(vowel.letter);
        console.log(recording);

        this.onStateChange({ disableMic: false }, false);
    }
}
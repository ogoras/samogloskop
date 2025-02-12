import GatheringVowelsView from "./GatheringVowelsView.js";
import DoubleProgressBar from "../../../visualization/progress_bar/DoubleProgressBar.js";
import TestGroupView from "../../training/TestGroupView.js";

export default class GatheringForeignView extends GatheringVowelsView {
    initialized = false;
    #currentlyPlaying = false;
    #startedRecording = false;
    #progressBarGray = false;

    /**
     * @param {boolean} value
     */
    set speechDetected(value) {
        const vowelGathered = this.vowelGatheredOnSpeechDetected(value);
        if (vowelGathered) {
            this.showNextRecording();
            this.progressBar.color = `#${this.vowelRecording.phoneme.rgb}`;
            this.#progressBarGray = false;
            this.progressBar.reset();
            this.refreshRecording();
        }
    }

    constructor(controller, recorder, prev) {
        if (prev instanceof TestGroupView) {
            prev.reset();
        }
        super(controller, recorder, prev);

        this.stackComponent.h2.innerHTML = `Teraz${controller.repeat ? ` ponownie` : ``} sprawdzimy Twoją umiejętność mówienia po angielsku z wymową amerykańską. Poproszę Cię o odsłuchanie nagrania, a następnie nagranie swojej próby wypowiedzenia usłyszanej samogłoski. Zrobimy tak dla wszystkich samogłosek występujących w dialekcie General American.`;

        if (prev) {
            this.formantsComponent.clear();
            this.formantsComponent.createCenterDiv().appendChild(this.stackComponent);
        }
    }

    initializeRecordings(foreignRecordings) {
        this.foreignRecordings = foreignRecordings;
        this.initialized = true;

        const button = this.button = document.createElement("button");
        button.innerHTML = "Przejdź do pierwszego nagrania";
        button.onclick = () => this.showFirstRecording();
        this.stackComponent.appendChild(button);
    }

    showFirstRecording() {
        if (!this.initialized) {
            console.log("Unfortunately, the recordings have not been initialized yet.");
            return;
        }
        this.button.remove();
        this.#generateRecordingTable();
        this.showNextRecording();
        this.controller.enableMic();
    }

    #generateRecordingTable() {
        const recordingTable = document.createElement("div");
        this.stackComponent.appendChild(recordingTable);
        // recordingTable is a vertical flexbox
        recordingTable.classList.add("recording-table");

        const vowelRow = this.#appendRowToTable(
            recordingTable, "Powtórz samogłoskę:",
            () => this.#playRecording("vowels"), true);
        const vowelIPA_element = this.vowelIPA_element = vowelRow.fragmentDescription;
        this.vowelButton = vowelRow.playButton;
        vowelIPA_element.classList.add("double-bold");

        const wordDescription = this.#appendRowToTable(
            recordingTable, "jak w słowie:",
            () => this.#playRecording("word")
        ).fragmentDescription;
        // wordDescription is a 2x2 grid with centered elements
        wordDescription.classList.add("grid");
        // top left element is the word
        const wordElement = this.wordElement = document.createElement("div");
        wordDescription.appendChild(wordElement);
        // top right element is the transcription
        const transcriptionElement = this.transcriptionElement = document.createElement("div");
        wordDescription.appendChild(transcriptionElement);
        // bottom left element is the translation
        const translationElement = this.translationElement = document.createElement("div");
        wordDescription.appendChild(translationElement);
        translationElement.style.fontSize = "1rem";

        const phraseDescription = this.#appendRowToTable(
            recordingTable, "w wyrażeniu:",
            () => this.#playRecording("phrase")
        ).fragmentDescription;
        // phraseDescription is a 2x1 grid with centered elements
        phraseDescription.classList.add("grid");
        phraseDescription.style.gridTemplateColumns = "auto";
        // top element is the phrase
        const phraseElement = this.phraseElement = document.createElement("div");
        phraseDescription.appendChild(phraseElement);
        phraseElement.style.textAlign = "right";
        // bottom element is the translation
        const phraseTranslationElement = this.phraseTranslationElement = document.createElement("div");
        phraseDescription.appendChild(phraseTranslationElement);
        phraseTranslationElement.style.fontSize = "1rem";
        phraseTranslationElement.style.textAlign = "right";

        const speakerElement = this.speakerElement = document.createElement("div");
        // force the speaker element to be right-aligned
        speakerElement.classList.add("speaker-element");
        this.stackComponent.appendChild(speakerElement);
    }

    showNextRecording() {
        // enable all play buttons
        const playButtons = this.stackComponent.element.querySelectorAll(".play-button");
        playButtons.forEach(button => button.classList.remove("disabled"));

        const vowelRecording = this.vowelRecording = this.controller.newVowelRecording();
        const color = `#${vowelRecording.phoneme.rgb}`;
        const vowelIPA = this.vowelIPA = vowelRecording.phoneme.IPA.broad;
        const sayOnlyMessage = this.sayOnlyMessage = `<b>Powiedz tylko <q>${vowelIPA}</q>, a nie całe słowo!</b>`
        this.stackComponent.h2.innerHTML = `Wysłuchaj nagrania${this.recording ? "" : ", w momencie gotowości włącz mikrofon"} i powtórz samogłoskę. ${sayOnlyMessage}`;

        this.vowelIPA_element.innerHTML = vowelIPA;
        this.vowelIPA_element.style.color = color;
        this.vowelButton.style.color = color;

        this.wordElement.innerHTML = vowelRecording.word;
        this.transcriptionElement.innerHTML = `/${vowelRecording.wordTranscription}/`;
        this.translationElement.innerHTML = `<i>${vowelRecording.wordTranslation}</i>`;

        this.phraseElement.innerHTML = vowelRecording.phrase;
        this.phraseTranslationElement.innerHTML = `<i>${vowelRecording.phraseTranslation}</i>`;

        const speakerInfo = vowelRecording.speakerInfo;
        this.speakerElement.innerHTML = `${speakerInfo.name}, ${speakerInfo.year}
            <br><a href="${speakerInfo.url}" target="_blank">źródło</a>`;
    }

    #appendRowToTable(table, text, playCallback, double) {
        const row = document.createElement("div");
        table.appendChild(row);
        row.classList.add("recording-row");

        const textElement = document.createElement("div");
        row.appendChild(textElement);
        textElement.classList.add("text-element", double ? "double" : "single");
        // add spacer to the right of the text
        const spacer = document.createElement("div");
        row.appendChild(spacer);
        spacer.style.width = "2rem";
        textElement.innerHTML = text;
        
        const recordingDescription = document.createElement("div");
        row.appendChild(recordingDescription);
        recordingDescription.classList.add("description");

        const fragmentDescription = document.createElement("div");
        recordingDescription.appendChild(fragmentDescription);
        fragmentDescription.classList.add("fragment-description");

        const playButton = document.createElement("button");
        playButton.innerHTML = "▶";
        playButton.onclick = playCallback;
        recordingDescription.appendChild(playButton);
        playButton.classList.add("play-button", double ? "big" : "small");

        return { fragmentDescription, playButton };
    }

    async #playRecording(type) {
        if (this.#currentlyPlaying) return;
        this.#currentlyPlaying = true;
        // disable mic while playing
        this.controller.disableMic();

        await this.vowelRecording.play(type);
        
        this.controller.enableMic();
        this.#currentlyPlaying = false;
    }

    recordingStarted() {
        const vowelGathered = super.recordingStarted(` <q>${this.vowelIPA}</q>, głośno i wyraźnie... ${this.sayOnlyMessage}`);
        if (vowelGathered && !this.#progressBarGray) {
            this.progressBar.swapColors();
            this.#progressBarGray = true;
            this.progressBar.reset();
            // disable play buttons
            const playButtons = this.stackComponent.element.querySelectorAll(".play-button");
            playButtons.forEach(button => button.classList.add("disabled"));
        }

        if (this.#startedRecording) return;
        this.#startedRecording = true;
        this.#addProgressBar();
    }

    recordingStopped() {
        super.recordingStopped();

        if (this.#startedRecording) {
            this.stackComponent.h2.innerHTML = this.startedSpeakingVowel ? "Włącz mikrofon, aby kontynuować..." :
            "Wysłuchaj nagrania, w momencie gotowości włącz mikrofon i powtórz samogłoskę... " + this.sayOnlyMessage;
        }
    }

    #addProgressBar() {
        const color = `#${this.controller.currentEntry.phoneme.rgb}`
        this.progressBar = new DoubleProgressBar(this.stackComponent, color);
    }

    set progress(value) {
        this.progressBar.progress = value * 100;
    }

    set secondaryProgress(value) {
        if (!this.progressBar) return;
        this.progressBar.secondaryProgress = value * 100;
    }
}
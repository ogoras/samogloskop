import SpeechView from "./SpeechView.js";
import View from "../View.js";
import DoubleProgressBar from "../visualization/progress_bar/DoubleProgressBar.js";
import GatheringVowelsView from "../GatheringVowelsView.js";
export default class GatheringForeignView extends SpeechView {
    initialized = false;
    #currentlyPlaying = false;
    #startedRecording = false;
    gatheringVowelsView = new GatheringVowelsView(this);
    #progressBarGray = false;
    /**
     * @param {boolean} value
     */
    set speechDetected(value) {
        const vowelGathered = this.gatheringVowelsView.vowelGatheredOnSpeechDetected(value);
        if (vowelGathered) {
            this.showNextRecording();
            this.progressBar.color = `#${this.vowelRecording.phoneme.rgb}`;
            this.#progressBarGray = false;
            this.progressBar.reset();
            this.refreshRecording();
        }
    }
    /**
     * @param {boolean} value
     */
    set vowelGathered(value) {
        this.gatheringVowelsView.vowelGathered = value;
    }
    constructor(controller, view) {
        super(controller, view);
        if (view instanceof View) {
            this.div = view.div;
            this.divStack = view.divStack;
            this.h2 = view.h2;
        }
        else {
            this.div = view;
            this.divStack = this.div.querySelector(".stack");
            this.h2 = document.createElement("h2");
            this.divStack.appendChild(this.h2);
        }
        this.h2.innerHTML = `Teraz${controller.repeat ? ` ponownie` : ``} sprawdzimy Twoją umiejętność mówienia po angielsku z wymową amerykańską. Poproszę Cię o odsłuchanie nagrania, a następnie nagranie swojej próby wypowiedzenia usłyszanej samogłoski. Zrobimy tak dla wszystkich samogłosek występujących w dialekcie General American.`;
        this.div.innerHTML = "";
        const centerDiv = document.createElement("div");
        centerDiv.classList.add("center");
        this.div.appendChild(centerDiv);
        centerDiv.appendChild(this.divStack);
        this.userVowels = controller.foreignInitial;
    }
    initializeRecordings(foreignRecordings) {
        this.foreignRecordings = foreignRecordings;
        this.initialized = true;
        const button = this.button = document.createElement("button");
        button.innerHTML = "Przejdź do pierwszego nagrania";
        button.onclick = () => this.showFirstRecording();
        this.divStack.appendChild(button);
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
        this.divStack.appendChild(recordingTable);
        // recordingTable is a vertical flexbox
        recordingTable.classList.add("recording-table");
        const vowelRow = this.#appendRowToTable(recordingTable, "Powtórz samogłoskę:", () => this.#playRecording("vowels"), true);
        const vowelIPA_element = this.vowelIPA_element = vowelRow.fragmentDescription;
        this.vowelButton = vowelRow.playButton;
        vowelIPA_element.classList.add("double-bold");
        const wordDescription = this.#appendRowToTable(recordingTable, "jak w słowie:", () => this.#playRecording("word")).fragmentDescription;
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
        const phraseDescription = this.#appendRowToTable(recordingTable, "w wyrażeniu:", () => this.#playRecording("phrase")).fragmentDescription;
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
        this.divStack.appendChild(speakerElement);
    }
    showNextRecording() {
        // enable all play buttons
        const playButtons = this.divStack.querySelectorAll(".play-button");
        playButtons.forEach(button => button.classList.remove("disabled"));
        const vowelRecording = this.vowelRecording = this.controller.newVowelRecording();
        const color = `#${vowelRecording.phoneme.rgb}`;
        const vowelIPA = this.vowelIPA = vowelRecording.phoneme.IPA.broad;
        const sayOnlyMessage = this.sayOnlyMessage = `<b>Powiedz tylko <q>${vowelIPA}</q>, a nie całe słowo!</b>`;
        this.h2.innerHTML = `Wysłuchaj nagrania${this.recording ? "" : ", w momencie gotowości włącz mikrofon"} i powtórz samogłoskę. ${sayOnlyMessage}`;
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
    #playRecording(type) {
        const vowelRecording = this.vowelRecording;
        switch (type) {
            case "vowels":
                this.#playSamples(vowelRecording.vowelSamples, vowelRecording.recording.sampleRate);
                break;
            case "word":
                this.#playSamples(vowelRecording.wordSamples, vowelRecording.recording.sampleRate);
                break;
            case "phrase":
                this.#playSamples(vowelRecording.phraseSamples, vowelRecording.recording.sampleRate);
                break;
            default:
                throw new Error(`Unknown recording type: ${type}`);
        }
    }
    #playSamples(samples, sampleRate = 48000) {
        if (this.#currentlyPlaying)
            return;
        this.#currentlyPlaying = true;
        // disable mic while playing
        this.controller.disableMic();
        const audioCtx = new AudioContext({ sampleRate });
        const audioBuffer = audioCtx.createBuffer(1, samples.length, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) {
            channelData[i] = samples[i];
        }
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
        source.onended = async () => {
            source.disconnect();
            await audioCtx.close();
            this.controller.enableMic();
            this.#currentlyPlaying = false;
        };
    }
    recordingStarted() {
        super.recordingStarted();
        const vowelGathered = this.gatheringVowelsView.recordingStarted(` <q>${this.vowelIPA}</q>, głośno i wyraźnie... ${this.sayOnlyMessage}`);
        if (vowelGathered && !this.#progressBarGray) {
            this.progressBar.swapColors();
            this.#progressBarGray = true;
            this.progressBar.reset();
            // disable play buttons
            const playButtons = this.divStack.querySelectorAll(".play-button");
            playButtons.forEach(button => button.classList.add("disabled"));
        }
        if (this.#startedRecording)
            return;
        this.#startedRecording = true;
        this.#addProgressBar();
    }
    recordingStopped() {
        super.recordingStopped();
        if (this.#startedRecording) {
            this.h2.innerHTML = this.gatheringVowelsView.startedSpeakingVowel ? "Włącz mikrofon, aby kontynuować..." :
                "Wysłuchaj nagrania, w momencie gotowości włącz mikrofon i powtórz samogłoskę... " + this.sayOnlyMessage;
        }
    }
    #addProgressBar() {
        const color = `#${this.controller.currentEntry.phoneme.rgb}`;
        this.progressBar = new DoubleProgressBar(this.divStack, color);
    }
    updateProgress(value, isTime = true) {
        if (isTime)
            throw new Error("Time-based progress is not supported in GatheringForeignView");
        else
            this.progressBar.progress = value * 100;
    }
    updateSecondaryProgress(value) {
        this.progressBar.secondaryProgress = value * 100;
    }
    close() {
        this.divStack.innerHTML = "";
    }
}

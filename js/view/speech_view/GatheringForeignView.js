import SpeechView from "./SpeechView.js";
import View from "../View.js";
import ProgressBar from "../visualization/ProgressBar.js";

export default class GatheringForeignView extends SpeechView {
    initialized = false;
    #currentlyPlaying = false;
    #startedRecording = false;

    constructor(controller, view) {
        super(controller, view);

        if (view instanceof View) {
            this.div = view.div;
            this.divStack = view.divStack;
            this.h2 = view.h2;
        } else {
            this.div = view;
            this.divStack = this.div.querySelector(".stack");

            this.h2 = document.createElement("h2");
            this.divStack.appendChild(this.h2);
        }

        this.h2.innerHTML = `Teraz sprawdzimy Twoją umiejętność mówienia po angielsku z wymową amerykańską. Poproszę Cię o odsłuchanie nagrania, a następnie nagranie swojej próby wypowiedzenia usłyszanej samogłoski. Zrobimy tak dla wszystkich samogłosek występujących w dialekcie General American.`;

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
        
        const vowelRecording = this.controller.newVowelRecording();
        const color = `#${vowelRecording.phoneme.rgb}`;
        console.log(vowelRecording);
        const vowelIPA = vowelRecording.phoneme.IPA.broad;
        this.h2.innerHTML = `Wysłuchaj nagrania, w momencie gotowości włącz mikrofon i powtórz samogłoskę. 
            <b>Powiedz tylko "${vowelIPA}", a nie całe słowo!</b>`;

        const recordingTable = document.createElement("div");
        this.divStack.appendChild(recordingTable);
        // recordingTable is a vertical flexbox
        recordingTable.classList.add("recording-table");

        const vowelIPA_element = this.#appendRowToTable(recordingTable, "Powtórz samogłoskę:", () => this.#playSamples(vowelRecording.vowelSamples, vowelRecording.recording.sampleRate), color);
        vowelIPA_element.innerHTML = vowelIPA;    
        vowelIPA_element.classList.add("double-bold");
        vowelIPA_element.style.color = color;

        const wordDescription = this.#appendRowToTable(recordingTable, "jak w słowie:", () => this.#playSamples(vowelRecording.wordSamples, vowelRecording.recording.sampleRate));
        // wordDescription is a 2x2 grid with centered elements
        wordDescription.classList.add("grid");
        // top left element is the word
        const wordElement = document.createElement("div");
        wordDescription.appendChild(wordElement);
        wordElement.innerHTML = vowelRecording.word;
        // top right element is the transcription
        const transcriptionElement = document.createElement("div");
        wordDescription.appendChild(transcriptionElement);
        transcriptionElement.innerHTML = `/${vowelRecording.wordTranscription}/`;
        // bottom left element is the translation
        const translationElement = document.createElement("div");
        wordDescription.appendChild(translationElement);
        translationElement.style.fontSize = "1rem";
        translationElement.innerHTML = `<i>${vowelRecording.wordTranslation}</i>`;

        const phraseDescription = this.#appendRowToTable(recordingTable, "w wyrażeniu:", () => this.#playSamples(vowelRecording.phraseSamples, vowelRecording.recording.sampleRate));
        // phraseDescription is a 2x1 grid with centered elements
        phraseDescription.classList.add("grid");
        phraseDescription.style.gridTemplateColumns = "auto";
        // top element is the phrase
        const phraseElement = document.createElement("div");
        phraseDescription.appendChild(phraseElement);
        phraseElement.style.textAlign = "right";
        phraseElement.innerHTML = vowelRecording.phrase;
        // bottom element is the translation
        const phraseTranslationElement = document.createElement("div");
        phraseDescription.appendChild(phraseTranslationElement);
        phraseTranslationElement.style.fontSize = "1rem";
        phraseTranslationElement.style.textAlign = "right";
        phraseTranslationElement.innerHTML = `<i>${vowelRecording.phraseTranslation}</i>`;

        const speakerInfo = vowelRecording.speakerInfo;
        const speakerElement = document.createElement("div");
        // force the speaker element to be right-aligned
        speakerElement.classList.add("speaker-element")
        this.divStack.appendChild(speakerElement);
        speakerElement.innerHTML = `${speakerInfo.name}, ${speakerInfo.year}
        <br><a href="${speakerInfo.url}" target="_blank">źródło</a>`;

        this.controller.enableMic();
    }

    #appendRowToTable(table, text, playCallback, color) {
        const row = document.createElement("div");
        table.appendChild(row);
        row.classList.add("recording-row");

        const textElement = document.createElement("div");
        row.appendChild(textElement);
        textElement.classList.add("text-element", color ? "double" : "single");
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
        playButton.classList.add("play-button", color ? "big" : "small");
        if (color) playButton.style.color = color;

        return fragmentDescription;
    }

    #playSamples(samples, sampleRate = 48000) {
        if (this.#currentlyPlaying) return;
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

        if (this.#startedRecording) return;
        this.#startedRecording = true;
        
        this.#addProgressBar();
    }

    #addProgressBar() {
        const color = `#${this.controller.currentEntry.phoneme.rgb}`
        const progressBar = this.progressBar = new ProgressBar(this.divStack, color);
    }
}
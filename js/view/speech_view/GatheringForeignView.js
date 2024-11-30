import SpeechView from "./SpeechView.js";

export default class GatheringForeignView extends SpeechView {
    initialized = false;
    #currentlyPlaying = false;

    constructor(controller, view) {
        super(controller, view);

        this.div = view.div;
        this.divStack = view.divStack;
        this.h2 = view.h2;

        this.h2.innerHTML = `Teraz sprawdzimy Twoją umiejętność mówienia po angielsku z wymową amerykańską. Poproszę Cię o odsłuchanie nagrania, a następnie nagranie swojej próby wypowiedzenia usłyszanej samogłoski. Zrobimy tak dla wszystkich samogłosek występujących w dialekcie General American.`;

        this.div.innerHTML = "";
        let centerDiv = document.createElement("div");
        centerDiv.classList.add("center");
        this.div.appendChild(centerDiv);
        centerDiv.appendChild(this.divStack);

        this.userVowels = controller.foreignInitial;
    }

    initializeRecordings(foreignRecordings) {
        this.foreignRecordings = foreignRecordings;
        this.initialized = true;

        let button = this.button = document.createElement("button");
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
        
        let vowelRecording = this.controller.getRecordingEntry();
        let color = `#${vowelRecording.phoneme.rgb}`;
        console.log(vowelRecording);
        let vowelIPA = vowelRecording.phoneme.IPA.broad;
        this.h2.innerHTML = `Wysłuchaj nagrania, w momencie gotowości włącz mikrofon i powtórz samogłoskę. 
            <b>Powiedz tylko "${vowelIPA}", a nie całe słowo!</b>`;

        let recordingTable = document.createElement("div");
        this.divStack.appendChild(recordingTable);
        // recordingTable is a vertical flexbox
        recordingTable.style.display = "flex";
        recordingTable.style.flexDirection = "column";
        recordingTable.style.marginTop = "2rem";
        recordingTable.style.marginBottom = "1rem";

        let vowelIPA_element = this.#appendRowToTable(recordingTable, "Powtórz samogłoskę:", () => this.#playSamples(vowelRecording.vowelSamples, vowelRecording.recording.sampleRate), color);
        vowelIPA_element.innerHTML = vowelIPA;    
        vowelIPA_element.style.fontSize = "3.8rem";
        vowelIPA_element.style.fontWeight = "bold";
        vowelIPA_element.style.color = color;

        let wordDescription = this.#appendRowToTable(recordingTable, "jak w słowie:", () => this.#playSamples(vowelRecording.wordSamples, vowelRecording.recording.sampleRate));
        wordDescription.style.fontSize = "1.8rem";
        // wordDescription is a 2x2 flexbox with centered elements
        wordDescription.style.display = "grid";
        wordDescription.style.gridTemplateColumns = "auto auto";
        wordDescription.style.gridTemplateRows = "1fr 1fr";
        wordDescription.style.gap = "10px";
        // top left element is the word
        let wordElement = document.createElement("div");
        wordDescription.appendChild(wordElement);
        wordElement.innerHTML = vowelRecording.word;
        // top right element is the transcription
        let transcriptionElement = document.createElement("div");
        wordDescription.appendChild(transcriptionElement);
        transcriptionElement.innerHTML = `/${vowelRecording.wordTranscription}/`;
        // bottom left element is the translation
        let translationElement = document.createElement("div");
        wordDescription.appendChild(translationElement);
        translationElement.style.fontSize = "1rem";
        translationElement.innerHTML = `<i>${vowelRecording.wordTranslation}</i>`;

        let phraseDescription = this.#appendRowToTable(recordingTable, "w wyrażeniu:", () => this.#playSamples(vowelRecording.phraseSamples, vowelRecording.recording.sampleRate));
        // phraseDescription is a 2x1 grid with centered elements
        phraseDescription.style.display = "grid";
        phraseDescription.style.gridTemplateColumns = "1fr";
        phraseDescription.style.gridTemplateRows = "1fr 1fr";
        phraseDescription.style.gap = "10px";
        // top element is the phrase
        let phraseElement = document.createElement("div");
        phraseDescription.appendChild(phraseElement);
        phraseElement.style.fontSize = "1.8rem";
        phraseElement.style.textAlign = "right";
        phraseElement.innerHTML = vowelRecording.phrase;
        // bottom element is the translation
        let phraseTranslationElement = document.createElement("div");
        phraseDescription.appendChild(phraseTranslationElement);
        phraseTranslationElement.style.textAlign = "right";
        phraseTranslationElement.innerHTML = `<i>${vowelRecording.phraseTranslation}</i>`;

        let speakerInfo = vowelRecording.speakerInfo;
        let speakerElement = document.createElement("div");
        // force the speaker element to be right-aligned
        speakerElement.style.margin = "0.5rem";
        speakerElement.style.marginLeft = "auto";
        speakerElement.style.textAlign = "right";
        this.divStack.appendChild(speakerElement);
        speakerElement.innerHTML = `${speakerInfo.name}, ${speakerInfo.year}
        <br><a href="${speakerInfo.url}" target="_blank">źródło</a>`;

        this.controller.enableMic();
    }

    #appendRowToTable(table, text, playCallback, color) {
        let row = document.createElement("div");
        table.appendChild(row);
        row.style.display = "flex";
        row.style.justifyContent = "space-between";

        // add an element that's aligned to the left
        let textElement = document.createElement("div");
        row.appendChild(textElement);
        // center the text vertically
        textElement.style.display = "flex";
        textElement.style.alignItems = "center";
        textElement.style.height = color ? "3.8rem" : "1.8rem";
        // add spacer to the right of the text
        let spacer = document.createElement("div");
        row.appendChild(spacer);
        spacer.style.width = "2rem";
        textElement.innerHTML = text;
        
        // add an element that's aligned to the right
        let recordingDescription = document.createElement("div");
        row.appendChild(recordingDescription);
        // recordingDescription is a horizontal flexbox aligned to the right
        recordingDescription.style.display = "flex";
        recordingDescription.style.flexDirection = "row";
        recordingDescription.style.justifyContent = "flex-end";
        recordingDescription.style.alignItems = "top";

        let fragmentDescription = document.createElement("div");
        recordingDescription.appendChild(fragmentDescription);
        fragmentDescription.style.marginRight = "1rem";

        let playButton = document.createElement("button");
        playButton.innerHTML = "▶";
        playButton.onclick = playCallback;
        recordingDescription.appendChild(playButton);
        // play button should be the size of the text
        playButton.style.padding = "0";
        playButton.style.width = "2em";
            playButton.style.height = "2em";
        if (color) {
            playButton.style.color = color;
            playButton.style.fontSize = "2rem";
        }
        else {
            playButton.style.fontSize = "1rem";
            playButton.style.marginRight = "2.2rem";
        }

        return fragmentDescription;
    }

    #playSamples(samples, sampleRate = 48000) {
        if (this.#currentlyPlaying) return;
        this.#currentlyPlaying = true;
        // disable mic while playing
        this.controller.disableMic();

        let audioCtx = new AudioContext({ sampleRate });
        let audioBuffer = audioCtx.createBuffer(1, samples.length, sampleRate);
        let channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < samples.length; i++) {
            channelData[i] = samples[i];
        }
        let source = audioCtx.createBufferSource();
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
}
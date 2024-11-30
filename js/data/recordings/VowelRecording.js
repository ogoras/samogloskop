import { VOWEL_INVENTORIES, VOWEL_DICTS } from "../../const/vowel_inventories/VOWEL_INVENTORIES.js";

export default class VowelRecording {
    get word() {
        return this.wordInterval.text;
    }

    get wordTranslation() {
        return this.wordInterval.translation;
    }

    get wordTranscription() {
        return this.wordPhonemes.join("");
    }

    get phrase() {
        return this.phraseInterval.text;
    }

    get phraseTranslation() {
        return this.phraseInterval.translation;
    }

    get vowelSamples() {
        return this.recording.getSamples(this.vowelInterval);
    }

    get wordSamples() {
        return this.recording.getSamples(this.wordInterval);
    }

    get phraseSamples() {
        return this.recording.getSamples(this.phraseInterval);
    }

    get speakerInfo() {
        return this.recording.speakerInfo;
    }

    constructor({speaker, recording, interval}, language = "EN") {
        this.speaker = speaker;
        this.recording = recording;
        this.vowelInterval = interval;

        this.phoneme = VOWEL_INVENTORIES[language][VOWEL_DICTS[language][this.vowelInterval.text]];

        this.wordInterval = this.recording.textGrid.getWordIntervalAt(this.vowelInterval.xmin);
        this.phraseInterval = this.recording.textGrid.getPhraseIntervalAt(this.vowelInterval.xmin);
        this.wordPhonemes = this.recording.textGrid.getPhonemesIn(this.wordInterval)
            .map(interval => interval.text);
    }
}
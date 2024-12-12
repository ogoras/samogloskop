import { VOWEL_INVENTORIES, VOWEL_DICTS } from "../../const/VOWEL_INVENTORIES.js";
export default class VowelRecording {
    get word() {
        return this.wordInterval.text;
    }
    get wordTranslation() {
        return this.wordInterval.translation;
    }
    get wordTranscription() {
        const phonemes = this.wordPhonemes;
        const index = this.phonemeIndexInWord;
        phonemes[index] = `<b>${phonemes[index]}</b>`;
        return phonemes.join("");
    }
    get phrase() {
        return this.phraseInterval.text;
    }
    get phraseTranslation() {
        return this.phraseInterval.translation;
    }
    get vowelSamples() {
        return this.recording.getSamples(this.vowelInterval, 0.05);
    }
    get wordSamples() {
        return this.recording.getSamples(this.wordInterval, 0.05);
    }
    get phraseSamples() {
        return this.recording.getSamples(this.phraseInterval);
    }
    get speakerInfo() {
        return this.recording.speakerInfo;
    }
    constructor({ speaker, recording, interval }, language = "EN") {
        this.speaker = speaker;
        this.recording = recording;
        this.vowelInterval = interval;
        this.phoneme = VOWEL_INVENTORIES[language][VOWEL_DICTS[language][this.vowelInterval.text]];
        this.wordInterval = this.recording.textGrid.getWordIntervalAt(this.vowelInterval.xmin);
        this.phraseInterval = this.recording.textGrid.getPhraseIntervalAt(this.vowelInterval.xmin);
        const wordIntervals = this.recording.textGrid.getPhonemesIn(this.wordInterval);
        this.phonemeIndexInWord = wordIntervals.indexOf(this.vowelInterval);
        this.wordPhonemes = wordIntervals.map(interval => interval.text);
    }
}

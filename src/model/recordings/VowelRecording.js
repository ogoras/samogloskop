import { VOWEL_INVENTORIES, VOWEL_DICTS } from "../../const/VOWEL_INVENTORIES.js";
import { playSamples } from "../../logic/util/audio.js";

export default class VowelRecording {
    get word() {
        return this.wordInterval.text;
    }

    get wordTranslation() {
        return this.wordInterval.translation;
    }

    get wordTranscription() {
        return this.getWordTranscription();
    }

    getWordTranscription(bold = "single") {
        const phonemes = this.wordPhonemes;
        if (bold === "single") {
            const index = this.phonemeIndexInWord;
            phonemes[index] = `<b>${phonemes[index]}</b>`;
        } else if (bold === "all") {
            for (let i = 0; i < phonemes.length; i++) {
                if (phonemes[i] === (this.phoneme.letter ?? this.phoneme.IPA.broad)) {
                    phonemes[i] = `<b>${phonemes[i]}</b>`;
                }
            }
        }
        return phonemes.join("");
    }

    get phrase() {
        return this.phraseInterval.text;
    }

    get phraseTranslation() {
        return this.phraseInterval.translation;
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
        const wordIntervals = this.recording.textGrid.getPhonemesIn(this.wordInterval)
        this.phonemeIndexInWord = wordIntervals.indexOf(this.vowelInterval);
        this.wordPhonemes = wordIntervals.map(interval => interval.text);
    }

    async play(type = "phrase") {
        switch(type) {
            case "vowels":
                await playSamples(this.recording.getSamples(this.vowelInterval, 0.05), this.sampleRate)
                break;
            case "word":
                await playSamples(this.recording.getSamples(this.wordInterval, 0.05), this.sampleRate);
                break;
            case "phrase":
                await playSamples(this.recording.getSamples(this.phraseInterval), this.sampleRate);
                break;
            default:
                throw new Error(`Unknown recording type: ${type}`);
        }
    }
}
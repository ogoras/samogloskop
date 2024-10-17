import { phonemes } from '../../definitions/polishVowels.js';

export class UserVowels {
    phonemesRemaining = [...phonemes];
    phonemesProcessed = [];

    nextVowel() {
        let index = Math.floor(Math.random() * this.phonemesRemaining.length);
        let phoneme = this.currentPhoneme = this.phonemesRemaining[index];
        this.phonemesRemaining.splice(index, 1);
        return phoneme;
    }

    addFormants(formants) {
        if (!this.currentPhoneme.formants) this.currentPhoneme.formants = [];
        this.currentPhoneme.formants.push(formants);
    }
}
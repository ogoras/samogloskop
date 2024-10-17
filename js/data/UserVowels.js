import { phonemes } from '../definitions/polishVowels.js';

const REQUIRED_FORMANTS = 20;
export class UserVowels {
    phonemesRemaining = [...phonemes];
    phonemesProcessed = [];

    nextVowel() {
        if (this.isDone()) return undefined;
        let index = Math.floor(Math.random() * this.phonemesRemaining.length);
        let phoneme = this.currentPhoneme = this.phonemesRemaining[index];
        this.phonemesRemaining.splice(index, 1);
        return phoneme;
    }

    addFormants(formants) {
        if (!formants) return;
        if (!this.currentPhoneme) throw new Error("No current phoneme");
        if (!this.currentPhoneme.formants) this.currentPhoneme.formants = [];
        this.currentPhoneme.formants.push(formants);
    }

    isVowelGathered() {
        if (!this.currentPhoneme.formants) this.currentPhoneme.formants = [];
        return this.currentPhoneme.formants.length >= REQUIRED_FORMANTS;
    }

    saveVowel() {
        this.phonemesProcessed.push(this.currentPhoneme);
        this.currentPhoneme = undefined;
    }

    isDone() {
        return this.phonemesRemaining.length === 0;
    }
}
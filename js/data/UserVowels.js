import { phonemes } from '../definitions/polishVowels.js';

const REQUIRED_FORMANTS = 20;
export class UserVowels {
    phonemesRemaining = [...phonemes];
    phonemesProcessed = [];

    nextVowel() {
        if (this.phonemesRemaining.length === 0) return undefined;
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
        this.currentPhoneme.avg = { label: this.currentPhoneme.letter, color: this.currentPhoneme.color };
        for (let attribute of ["x", "y", "size"]) this.calculateAvg(attribute);
        this.currentPhoneme.avg.size *= 1.5;
        let ret = this.currentPhoneme;
        this.phonemesProcessed.push(ret);
        this.currentPhoneme = undefined;
        return ret;
    }

    isDone() {
        return this.phonemesRemaining.length === 0 && !this.currentPhoneme;
    }

    calculateAvg(attribute) {
        this.currentPhoneme.avg[attribute] = this.currentPhoneme.formants.reduce((acc, formant) => acc + formant[attribute], 0) / this.currentPhoneme.formants.length;
    }

    toString() {
        return JSON.stringify(
            this.phonemesProcessed.map(phoneme => { return {
                letter: phoneme.letter,
                color: phoneme.color,
                formants: phoneme.formants.map(formant => { return {
                    x: formant.x,
                    y: formant.y
                }})
            }})
        );
    }
}
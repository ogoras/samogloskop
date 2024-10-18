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
        this.calculateAverage();
        let ret = this.currentPhoneme;
        this.phonemesProcessed.push(ret);
        this.currentPhoneme = undefined;
        return ret;
    }

    calculateAverage(phoneme = this.currentPhoneme) {
        phoneme.avg = { label: phoneme.letter, color: phoneme.color };
        for (let attribute of ["x", "y", "size"]) calculateAverageAttribute(phoneme, attribute);
        phoneme.avg.size *= 1.5;
    }

    isDone() {
        return this.phonemesRemaining.length === 0 && !this.currentPhoneme;
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

    static fromString(string) {
        let phonemesProcessed = JSON.parse(string);
        let userVowels = new UserVowels();
        userVowels.phonemesRemaining = [];
        userVowels.phonemesProcessed = phonemesProcessed;
        for (let phoneme of phonemesProcessed) {
            userVowels.calculateAverage(phoneme);
            for (let formant of phoneme.formants) {
                formant.color = phoneme.color;
            }
        }
        return userVowels;
    }
}

function calculateAverageAttribute(phoneme, attribute) {
    phoneme.avg[attribute] = 
        phoneme.formants.reduce((acc, formant) => acc + formant[attribute], 0) 
        / phoneme.formants.length;
}
import { vowels } from '../const/polishVowels.js';
import { Vowel } from './Vowel.js';

const REQUIRED_FORMANTS = 20;
export class SpeakerVowels {
    vowelsRemaining = [...vowels];
    vowelsProcessed = [];

    nextVowel() {
        if (this.vowelsRemaining.length === 0) return undefined;
        let index = Math.floor(Math.random() * this.vowelsRemaining.length);
        let vowel = this.currentVowel = this.vowelsRemaining[index];
        this.vowelsRemaining.splice(index, 1);
        return vowel;
    }

    addFormants(formants) {
        if (!formants) return;
        if (!this.currentVowel) throw new Error("No current vowel");
        this.currentVowel.addFormants(formants);
    }

    isVowelGathered() {
        return this.currentVowel.formants.length >= REQUIRED_FORMANTS;
    }

    saveVowel() {
        this.currentVowel.calculateAverage();
        let ret = this.currentVowel;
        this.vowelsProcessed.push(ret);
        this.currentVowel = undefined;
        return ret;
    }

    isDone() {
        return this.vowelsRemaining.length === 0 && !this.currentVowel;
    }

    toString() {
        return JSON.stringify(
            this.vowelsProcessed.map(vowel => { return vowel.toSimpleObject();})
        );
    }

    static fromString(string) {
        let vowelsProcessed = JSON.parse(string);
        let speakerVowels = new SpeakerVowels();
        speakerVowels.vowelsRemaining = [];
        speakerVowels.vowelsProcessed = vowelsProcessed.map(Vowel.fromSimpleObject);
        return speakerVowels;
    }
}
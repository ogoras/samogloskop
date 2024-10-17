import { phonemes } from '../../definitions/polishVowels.js';

export class UserVowels {
    phonemesRemaining = [...phonemes];

    nextVowel() {
        let index = Math.floor(Math.random() * this.phonemesRemaining.length);
        let phoneme = this.currentPhoneme = this.phonemesRemaining[index];
        this.phonemesRemaining.splice(index, 1);
        return phoneme;
    }
}
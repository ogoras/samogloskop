const phonemes = "aeiouy";
export class UserVowels {
    phonemesRemaining = phonemes.split('');

    nextVowel() {
        let index = Math.floor(Math.random() * this.phonemesRemaining.length);
        let phoneme = this.currentPhoneme = this.phonemesRemaining[index];
        this.phonemesRemaining.splice(index, 1);
        return phoneme;
    }
}
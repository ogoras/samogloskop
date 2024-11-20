import Vowel from './Vowel.js';
import { VOWEL_DICTS, VOWEL_INVENTORIES } from '../../const/vowel_inventories/VOWEL_INVENTORIES.js';
import { POINT_SIZES } from '../../const/POINT_SIZES.js';

export default class Vowels {   // represents a set of vowels for a particular speaker (see SpeakerVowels), language or population
    initialized = false;

    getSingleMeasurements(letter) {
        if (!this.initialized) throw new Error("Data not initialized");
        if (letter === undefined) {
            return [].concat(...this.vowels.map(vowel => vowel.formants));
        }
        return this.vowels[VOWEL_DICTS[this.language][letter]].formants;
    }

    getCentroids(letter) {
        if (!this.initialized) throw new Error("Data not initialized");
        if (letter === undefined) {
            return this.vowels.map(vowel => vowel.avg);
        }
        return [this.vowels[VOWEL_DICTS[this.language][letter]].avg];
    }

    constructor(language = "PL", dataset, callback) {
        this.language = language;
        if (!VOWEL_INVENTORIES[language]) {
            throw new Error(`Language ${language} not supported`);
        }
        this.vowels = VOWEL_INVENTORIES[language].map(vowel => new Vowel(vowel));
        if (!dataset) return;
        fetch(`./js/const/vowel_measurements/${dataset}.json`)
            .then(response => response.json())
            .then(data => {
                for (let vowel of this.vowels) {
                    vowel.formants = data[vowel.key()].map(formants => {
                        return { 
                            y: formants.F1 * 0.8,     // TODO: implement it better
                            x: formants.F2,
                            identified: formants.identified,
                        }
                    });
                    vowel.calculateAverage(POINT_SIZES.CENTROIDS);
                }
                this.initialized = true;
                callback();
            });
    }

    getVowelSymbols() {
        return this.vowels.map(vowel => vowel.IPA.broad ?? vowel.letter);
    }
}
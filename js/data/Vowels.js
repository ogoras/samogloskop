import Vowel from './Vowel.js';
import { VOWELS_PER_LANGUAGE } from '../const/vowels/vowels.js';

export default class Vowels {
    initialized = false;

    get singleMeasurements() {
        if (!this.initialized) throw new Error("Data not initialized");
        return [].concat(...this.vowels.map(vowel => vowel.formants));
    }

    get centroids() {
        if (!this.initialized) throw new Error("Data not initialized");
        return this.vowels.map(vowel => vowel.avg);
    }

    constructor(language, dataset, callback) {
        if (!VOWELS_PER_LANGUAGE[language]) throw new Error(`Language ${language} not supported`);
        this.vowels = VOWELS_PER_LANGUAGE[language];
        fetch(`./js/const/vowels/${dataset}.json`).then(response => response.json()).then(data => {
            for (let vowel of this.vowels) {
                vowel.formants = data[vowel.key()].map(formants => {
                    return { 
                        y: formants.F1 * 0.8,     // TODO: implement it better
                        x: formants.F2,
                        identified: formants.identified,
                        size: 3,
                        color: vowel.color + (formants.identified ? "80" : "40")
                    }
                });
                vowel.calculateAverage();
            }
            this.initialized = true;
            callback();
        });
    }
}
import Vowel from './Vowel.js';
import { VOWEL_INVENTORIES } from '../const/vowel_inventories/VOWEL_INVENTORIES.js';
import { POINT_SIZES } from '../const/POINT_SIZES.js';

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

    constructor(language = "PL", dataset, callback) {
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
}
import Vowel from './Vowel.js';
import { VOWEL_INVENTORIES, vowelLetterToIndex } from '../../const/VOWEL_INVENTORIES.js';
import { POINT_SIZES } from '../../const/POINT_SIZES.js';
export default class Vowels {
    initialized = false;
    static #canCreate = false;
    vowels;
    language;
    getVowelByLetter(letter) {
        const id = vowelLetterToIndex(letter, this.language);
        const vowel = this.vowels[id];
        if (!vowel)
            throw new Error(`Vowels object doesn't have the ${letter} vowel. Language: ${this.language}`);
        return vowel;
    }
    getSingleMeasurements(letter) {
        if (!this.initialized)
            throw new Error("Data not initialized");
        if (letter === undefined) {
            return [].concat(...this.vowels.map(vowel => vowel.formants));
        }
        return this.getVowelByLetter(letter).formants;
    }
    getCentroids(letter) {
        if (!this.initialized)
            throw new Error("Data not initialized");
        if (letter === undefined) {
            return this.vowels.map(vowel => vowel.avg);
        }
        return [this.getVowelByLetter(letter).avg];
    }
    constructor(language = "PL") {
        if (this.constructor === Vowels) {
            if (!Vowels.#canCreate) {
                throw new Error(`Class ${this.constructor.name} cannot be instantiated directly, use Vowels.create() instead`);
            }
            else {
                Vowels.#canCreate = false;
            }
        }
        this.language = language;
        if (!VOWEL_INVENTORIES[language]) {
            throw new Error(`Language ${language} not supported`);
        }
        this.vowels = VOWEL_INVENTORIES[language].map(vowel => new Vowel(vowel));
    }
    static async create(language, dataset) {
        this.#canCreate = true;
        const instance = new Vowels(language);
        const response = await fetch(`./data/vowel_measurements/${dataset}.json`);
        const data = await response.json();
        for (let vowel of instance.vowels) {
            const formants = data[vowel.key()]?.map(formants => {
                return {
                    y: formants.F1 * 0.8, // TODO: implement it better
                    x: formants.F2,
                    identified: formants.identified
                };
            });
            if (!formants)
                throw new Error(`Dataset ${dataset} doesn't have formants for the vowel ${vowel.key()}`);
            vowel.formants = formants;
            vowel.calculateAverage(POINT_SIZES.CENTROIDS);
        }
        instance.initialized = true;
        return instance;
    }
    getVowelSymbols() {
        return this.vowels.map(vowel => vowel.IPA?.broad ?? vowel.letter);
    }
}

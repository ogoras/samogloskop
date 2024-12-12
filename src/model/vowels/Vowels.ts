import Vowel, { formant } from './Vowel.js';
import { VOWEL_DICTS, VOWEL_INVENTORIES, vowelLetterToIndex } from '../../const/VOWEL_INVENTORIES.js';
import { POINT_SIZES } from '../../const/POINT_SIZES.js';

type vowelMeasurements = {
    [index: string]: {
        F1: number,
        F2: number,
        identified?: boolean
    }[]
}

export default class Vowels {   // represents a set of vowels for a particular speaker (see SpeakerVowels), language or population
    initialized = false;
    static #canCreate = false;
    vowels: Vowel[];
    language: string;

    private getVowelByLetter(letter: string): Vowel {
        const id = vowelLetterToIndex(letter, this.language);
        const vowel = this.vowels[id];
        if (!vowel) throw new Error(`Vowels object doesn't have the ${letter} vowel. Language: ${this.language}`);
        return vowel;
    }

    getSingleMeasurements(letter: string) {
        if (!this.initialized) throw new Error("Data not initialized");
        if (letter === undefined) {
            return ([] as formant[]).concat(...this.vowels.map(vowel => vowel.formants));
        }
        return this.getVowelByLetter(letter).formants;
    }

    getCentroids(letter: string) {
        if (!this.initialized) throw new Error("Data not initialized");
        if (letter === undefined) {
            return this.vowels.map(vowel => vowel.avg);
        }
        return [this.getVowelByLetter(letter).avg];
    }

    constructor(language = "PL") {
        if (this.constructor === Vowels) {
            if (!Vowels.#canCreate) {
                throw new Error(`Class ${this.constructor.name} cannot be instantiated directly, use Vowels.create() instead`);
            } else {
                Vowels.#canCreate = false;
            }
        }
        this.language = language;
        if (!VOWEL_INVENTORIES[language]) {
            throw new Error(`Language ${language} not supported`);
        }
        this.vowels = VOWEL_INVENTORIES[language].map(vowel => new Vowel(vowel));
    }

    static async create(language: string, dataset: string) {
        this.#canCreate = true;
        const instance = new Vowels(language);

        const response = await fetch(`./data/vowel_measurements/${dataset}.json`);
        const data: vowelMeasurements = await response.json();

        for (let vowel of instance.vowels) {
            const formants = data[vowel.key()]?.map(formants => {
                return { 
                    y: formants.F1 * 0.8,     // TODO: implement it better
                    x: formants.F2,
                    identified: formants.identified
                }
            });
            if (!formants) throw new Error(`Dataset ${dataset} doesn't have formants for the vowel ${vowel.key()}`);
            vowel.formants = formants;
            vowel.calculateAverage(POINT_SIZES.CENTROIDS);
        }
        instance.initialized = true;
        return instance;
    }

    static combine(...vowels: Vowels[]): Vowels {
        if (!vowels.length) throw new Error("No vowels to combine");
        this.#canCreate = true;
        const instance = new Vowels(vowels[0]!.language);
        vowels.forEach(vowels => {
            if (!vowels.initialized) throw new Error("Data not initialized");
            if (vowels.language !== instance.language) {
                throw new Error(`Cannot combine vowels from different languages: ${vowels.language} and ${instance.language}`);
            }
        })

        for (let i = 0; i < instance.vowels.length; i++) {
            instance.vowels[i]!.formants = vowels.flatMap(vowels => vowels.vowels[i]!.formants);
            instance.vowels[i]!.calculateAverage(POINT_SIZES.CENTROIDS);
        }

        instance.initialized = true;
        return instance;
    }

    getVowelSymbols() {
        return this.vowels.map(vowel => vowel.IPA?.broad ?? vowel.letter);
    }

    sortByID() {
        this.vowels.sort((a, b) => a.id - b.id);
    }
}
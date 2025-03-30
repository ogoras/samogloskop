import { POINT_SIZES } from '../../const/POINT_SIZES.js';
import Vowel, { formant } from './Vowel.js';
import Vowels from './Vowels.js';
import { vowel, vowelLetterToIndex } from '../../const/VOWEL_INVENTORIES.js';
import xy from "../../types/xy.js"
import RecursivePartial from '../../types/RecursivePartial.js';

interface vowelMeasurements extends Array<xy> {
    vowel: string,
    word: string,
    phrase: string
}

const REQUIRED_FORMANTS = 20;
// represents a set of vowels for a single speaker
export default class SpeakerVowels extends Vowels {
    vowelsRemaining = [...this.vowels];
    vowelsProcessed: Vowel[] = [];
    lobanovScaled = false;
    #meanFormants?: xy; #formantsDeviation?: xy;
    #gatheredAnything = false;
    #scaleCurrent = true;
    currentVowel: Vowel | undefined;
    #scaleFactor = 1;
    processedAt?: Date;

    get gatheredAnything() {
        return this.#gatheredAnything || this.vowelsProcessed.length > 0;
    }

    get meanFormants() {
        if (!this.#meanFormants || isNaN(this.#meanFormants.x) || isNaN(this.#meanFormants.y)) {
            if (!this.isDone()) {
                throw new Error("Trying to calculate mean formants before all vowels are gathered");
            }
            this.calculateMeanFormants();
        }
        if (!this.#meanFormants) throw new Error("Mean formants are not defined");
        if (isNaN(this.#meanFormants.x) || isNaN(this.#meanFormants.y)) {
            throw new Error("Mean formants are NaN");
        }
        return this.#meanFormants;
    }
    
    constructor(language: string) {
        super(language);
        this.initialized = true;
    }

    gatherMeasurements(measurements: vowelMeasurements[], scaleFactor = 1) {
        measurements.forEach(measurements => {
            const vowel = this.vowels[vowelLetterToIndex(measurements.vowel, this.language)];
            if (!vowel) throw new Error(`Could not find vowel ${measurements.vowel} in SpeakerVowels`);
            vowel.addFormants(...measurements);
        });
        this.vowelsProcessed = this.vowelsRemaining;
        this.vowelsRemaining = [];
        this.#gatheredAnything = true;
        this.vowels.forEach(vowel => {
            vowel.calculateAverage(POINT_SIZES.USER_CENTROIDS);
        });
        this.scaleLobanov();
        this.scaleByFactor(scaleFactor);
    }

    calculateMeanFormants() {
        this.#meanFormants = this.vowelsProcessed.reduce(
            (acc, vowel) => {
                return {
                    x: acc.x + vowel.avg!.x!,
                    y: acc.y + vowel.avg!.y!
                };
            },
            { x: 0, y: 0 }
        );
        this.#meanFormants.x /= this.vowelsProcessed.length;
        this.#meanFormants.y /= this.vowelsProcessed.length;
    }

    get formantsDeviation() {
        if (!this.#formantsDeviation || isNaN(this.#formantsDeviation.x) || isNaN(this.#formantsDeviation.y)) {
            if (!this.isDone()) {
                throw new Error("Trying to calculate formants deviation before all vowels are gathered");
            }
            this.calculateMeanFormantsDeviation();
        }
        if (!this.#formantsDeviation) throw new Error(`Formants deviation is undefined in ${this.constructor.name}`);
        if (isNaN(this.#formantsDeviation.x) || isNaN(this.#formantsDeviation.y)) { 
            throw new Error("Formants deviation are NaN");
        }
        return this.#formantsDeviation;
    }

    calculateMeanFormantsDeviation() {
        const varianceTimesN = this.vowelsProcessed.reduce(
            (acc, vowel) => {
                return {
                    x: acc.x + (vowel.avg!.x! - this.meanFormants.x) ** 2 + vowel.variance.x,
                    y: acc.y + (vowel.avg!.y! - this.meanFormants.y) ** 2 + vowel.variance.y
                };
            },
            { x: 0, y: 0 }
        );
        const N = this.vowelsProcessed.length;
        this.#formantsDeviation = {
            x: Math.sqrt(varianceTimesN.x / N),
            y: Math.sqrt(varianceTimesN.y / N)
        };
    }

    nextVowel() {
        if (this.vowelsRemaining.length === 0) return undefined;
        const index = Math.floor(Math.random() * this.vowelsRemaining.length);
        const vowel = this.currentVowel = this.vowelsRemaining[index];
        this.vowelsRemaining.splice(index, 1);
        return vowel;
    }

    addFormants(formants: formant) {
        if (!this.currentVowel) throw new Error("No current vowel");
        if (!formants) return this.currentVowel.formants.length / REQUIRED_FORMANTS;
        this.currentVowel.addFormants(formants);
        this.#gatheredAnything = true;
        return this.currentVowel.formants.length / REQUIRED_FORMANTS;
    }

    isVowelGathered() {
        return this.currentVowel && this.currentVowel.formants.length >= REQUIRED_FORMANTS;
    }

    saveVowel() {
        if (!this.currentVowel) throw new Error(`Could not save vowel: No current vowel`);
        this.currentVowel.calculateAverage(POINT_SIZES.USER_CENTROIDS);
        const ret = this.currentVowel;
        this.vowelsProcessed.push(ret);
        this.currentVowel = undefined;

        if (this.vowelsRemaining.length === 0) {
            this.processedAt = new Date();
        }

        return ret;
    }

    scaleLobanov() {
        if (this.lobanovScaled && this.#scaleCurrent) return;
        this.lobanovScaled = true;
        const oldMeanFormants = this.#meanFormants ?? {x: 0, y: 0};
        const oldFormantsDeviation = this.#formantsDeviation ?? {x: 1, y: 1};
        this.calculateMeanFormants();
        this.calculateMeanFormantsDeviation();
        this.vowelsProcessed.forEach(vowel => vowel.scaleLobanov(this.#meanFormants!, this.#formantsDeviation!));
        this.#meanFormants!.x = oldMeanFormants.x + this.#meanFormants!.x * oldFormantsDeviation.x;
        this.#meanFormants!.y = oldMeanFormants.y + this.#meanFormants!.y * oldFormantsDeviation.y;
        this.#formantsDeviation!.x *= oldFormantsDeviation.x;
        this.#formantsDeviation!.y *= oldFormantsDeviation.y;
    }

    scaleByFactor(factor: number) {
        this.vowelsProcessed.forEach(vowel => vowel.scaleByFactor(factor));
        this.#scaleFactor *= factor;
    }

    scale(point: xy) {
        // modifies the point in place
        if (!point || !this.lobanovScaled) return point;
        point.x = (point.x - this.meanFormants.x) / this.formantsDeviation.x;
        point.y = (point.y - this.meanFormants.y) / this.formantsDeviation.y;
        return point;
    }

    isDone() {
        return this.vowelsRemaining.length === 0 && !this.currentVowel;
    }

    compact() {
        return {
            vowelsProcessed: this.vowelsProcessed.map(vowel => { return vowel.toSimpleObject();}),
            lobanovScaled: this.lobanovScaled,
            meanFormants: this.#meanFormants,
            formantsDeviation: this.#formantsDeviation,
            processedAt: this.processedAt
        };
    }

    override toString() {
        return JSON.stringify(this.compact());
    }

    resetVowel(vowel?: RecursivePartial<vowel> | Vowel, autoStart: boolean = false) {
        if (!vowel) vowel  = this.vowelsProcessed[this.vowelsProcessed.length - 1];
        const vowelObject = new Vowel(vowel);
        const index = this.vowelsProcessed.findIndex(v => v.id === vowelObject.id);
        if (index === -1) {
            console.log(vowelObject);
            console.log(this.vowelsProcessed);
            throw new Error("Vowel not found");
        }
        const vowelToReset = this.vowelsProcessed.splice(index, 1)[0];
        this.#scaleCurrent = false;
        vowelToReset!.reset();
        if (autoStart) {
            this.currentVowel = vowelToReset;
        } else {
            this.vowelsRemaining.push(vowelToReset!);
        }
    }

    static fromString(string: string, language = "PL", scaleLobanov = true) {
        const obj = JSON.parse(string);
        const speakerVowels = new SpeakerVowels(language);
        speakerVowels.vowelsRemaining = [];
        speakerVowels.vowels = speakerVowels.vowelsProcessed = obj.vowelsProcessed.map(
            (vowel: RecursivePartial<vowel> & {letter: string, formants: formant[]}) => Vowel.fromSimpleObject({...vowel, language}));
        if (!obj.lobanovScaled) {
            if (scaleLobanov) speakerVowels.scaleLobanov();
        }
        else {
            speakerVowels.lobanovScaled = true;
            speakerVowels.#meanFormants = obj.meanFormants;
            speakerVowels.#formantsDeviation = obj.formantsDeviation;
        }
        speakerVowels.#gatheredAnything = true;
        speakerVowels.sortByID();
        speakerVowels.processedAt = new Date(obj.processedAt);
        return speakerVowels;
    }
}
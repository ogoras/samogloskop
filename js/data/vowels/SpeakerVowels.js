import { POINT_SIZES } from '../../const/POINT_SIZES.js';
import Vowel from './Vowel.js';
import Vowels from './Vowels.js';
import Recording from '../recordings/Recording.js';
import { VOWEL_DICTS } from '../../const/vowel_inventories/VOWEL_INVENTORIES.js';

const REQUIRED_FORMANTS = 20;
export default class SpeakerVowels extends Vowels { // represents a set of vowels for a single speaker
    vowelsRemaining = [...this.vowels];
    vowelsProcessed = [];
    lobanovScaled = false;
    #meanFormants; #formantsDeviation;
    #gatheredAnything = false;
    #scaleCurrent = true;

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
        if (isNaN(this.#meanFormants.x) || isNaN(this.#meanFormants.y)) throw new Error("Mean formants are NaN");
        return this.#meanFormants;
    }
    
    constructor(language, speaker, callback) {
        super(language);
        if (!speaker) return;
        this.loadFromRecordings(speaker)
            .then(() => {
                this.initialized = true;
                console.log(this)
                callback?.();
            });
    }

    async loadFromRecordings(speaker) {
        this.speaker = speaker;
        let measurements = recordings.flatMap(recording => recording.getVowelMeasurements(this.vowels));
        measurements.forEach(measurements => {
            let vowel = this.vowels[VOWEL_DICTS[this.language][measurements.vowel]];
            vowel.addFormants(...measurements);
        });
        this.vowelsProcessed = this.vowelsRemaining;
        this.vowelsRemaining = [];
        this.#gatheredAnything = true;
        this.vowels.forEach(vowel => {
            vowel.calculateAverage(POINT_SIZES.USER_CENTROIDS)
        });
        this.scaleLobanov();
    }

    calculateMeanFormants() {
        this.#meanFormants = this.vowelsProcessed.reduce(
            (acc, vowel) => {
                return {
                    x: acc.x + vowel.avg.x,
                    y: acc.y + vowel.avg.y
                };
            },
            { x: 0, y: 0 }
        );
        this.#meanFormants.x /= this.vowelsProcessed.length;
        this.#meanFormants.y /= this.vowelsProcessed.length;
    }

    get formantsDeviation() {
        if (!this.#formantsDeviation || isNaN(this.#formantsDeviation.x) || isNaN(this.#formantsDeviation.y)) {
            if (!this.isDone()) throw new Error("Trying to calculate formants deviation before all vowels are gathered");
            this.calculateMeanFormantsDeviation();
        }
        if (isNaN(this.#formantsDeviation.x) || isNaN(this.#formantsDeviation.y)) throw new Error("Formants deviation are NaN");
        return this.#formantsDeviation;
    }

    calculateMeanFormantsDeviation() {
        let varianceTimesN = this.vowelsProcessed.reduce(
            (acc, vowel) => {
                return {
                    x: acc.x + (vowel.avg.x - this.meanFormants.x) ** 2 + vowel.variance.x,
                    y: acc.y + (vowel.avg.y - this.meanFormants.y) ** 2 + vowel.variance.y
                };
            },
            { x: 0, y: 0 }
        );
        let n = this.vowelsProcessed.length;
        this.#formantsDeviation = {
            x: Math.sqrt(varianceTimesN.x / n),
            y: Math.sqrt(varianceTimesN.y / n)
        };
    }

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
        this.#gatheredAnything = true;
    }

    isVowelGathered() {
        return this.currentVowel.formants.length >= REQUIRED_FORMANTS;
    }

    saveVowel() {
        this.currentVowel.calculateAverage(POINT_SIZES.USER_CENTROIDS);
        let ret = this.currentVowel;
        this.vowelsProcessed.push(ret);
        this.currentVowel = undefined;
        return ret;
    }

    scaleLobanov() {
        if (this.lobanovScaled && this.#scaleCurrent) return;
        this.lobanovScaled = true;
        let oldMeanFormants = this.#meanFormants ?? {x: 0, y: 0};
        let oldFormantsDeviation = this.#formantsDeviation ?? {x: 1, y: 1};
        this.calculateMeanFormants();
        this.calculateMeanFormantsDeviation();
        this.vowelsProcessed.forEach(vowel => vowel.scaleLobanov(this.#meanFormants, this.#formantsDeviation));
        this.#meanFormants.x = oldMeanFormants.x + this.#meanFormants.x * oldFormantsDeviation.x;
        this.#meanFormants.y = oldMeanFormants.y + this.#meanFormants.y * oldFormantsDeviation.y;
        this.#formantsDeviation.x *= oldFormantsDeviation.x;
        this.#formantsDeviation.y *= oldFormantsDeviation.y;
    }

    scale(point) {
        // modifies the point in place
        if (!point || !this.lobanovScaled) return point;
        point.x = (point.x - this.meanFormants.x) / this.formantsDeviation.x;
        point.y = (point.y - this.meanFormants.y) / this.formantsDeviation.y;
        return point;
    }

    isDone() {
        return this.vowelsRemaining.length === 0 && !this.currentVowel;
    }

    toString() {
        return JSON.stringify({
            vowelsProcessed: this.vowelsProcessed.map(vowel => { return vowel.toSimpleObject();}),
            lobanovScaled: this.lobanovScaled,
            meanFormants: this.#meanFormants,
            formantsDeviation: this.#formantsDeviation
        });
    }

    resetVowel(vowel) {
        vowel = new Vowel(vowel);
        let index = this.vowelsProcessed.findIndex(v => v.id === vowel.id);
        if (index === -1) {
            console.log(vowel);
            console.log(this.vowelsProcessed);
            throw new Error("Vowel not found");
        }
        this.vowelsProcessed.splice(index, 1);
        this.vowelsRemaining.push(vowel);
        this.#scaleCurrent = false;
    }

    static fromString(string) {
        let obj = JSON.parse(string);
        let speakerVowels = new SpeakerVowels();
        speakerVowels.vowelsRemaining = [];
        speakerVowels.vowelsProcessed = obj.vowelsProcessed.map(Vowel.fromSimpleObject);
        if (!obj.lobanovScaled) speakerVowels.scaleLobanov();
        else {
            speakerVowels.lobanovScaled = true;
            speakerVowels.#meanFormants = obj.meanFormants;
            speakerVowels.#formantsDeviation = obj.formantsDeviation;
        }
        return speakerVowels;
    }
}
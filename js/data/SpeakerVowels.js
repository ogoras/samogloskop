import { POINT_SIZES } from '../const/POINT_SIZES.js';
import Vowel from './Vowel.js';
import Vowels from './Vowels.js';

const REQUIRED_FORMANTS = 20;
export default class SpeakerVowels extends Vowels {
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
        if (!this.#meanFormants) {
            if (!this.isDone()) {
                throw new Error("Trying to calculate mean formants before all vowels are gathered");
            }
            assertEqualNumberOfFormants(this.vowelsProcessed);
            this.#meanFormants = this.vowelsProcessed.reduce(
                (acc, vowel) => {
                    return {
                        x: acc.x + vowel.avg.x,
                        y: acc.y + vowel.avg.y
                    };
                },
                {x: 0, y: 0}
            );
            this.#meanFormants.x /= this.vowelsProcessed.length;
            this.#meanFormants.y /= this.vowelsProcessed.length;
        }
        return this.#meanFormants;
    }

    get formantsDeviation() {
        if (!this.#formantsDeviation) {
            if (!this.isDone()) throw new Error("Trying to calculate formants deviation before all vowels are gathered");
            assertEqualNumberOfFormants(this.vowelsProcessed);
            let varianceTimesN = this.vowelsProcessed.reduce(
                (acc, vowel) => {
                    return {
                        x: acc.x + (vowel.avg.x - this.meanFormants.x) ** 2 + vowel.variance.x,
                        y: acc.y + (vowel.avg.y - this.meanFormants.y) ** 2 + vowel.variance.y
                    };
                },
                {x: 0, y: 0}
            );
            let n = this.vowelsProcessed.length;
            this.#formantsDeviation = {
                x: Math.sqrt(varianceTimesN.x / n),
                y: Math.sqrt(varianceTimesN.y / n)
            };
        }
        return this.#formantsDeviation;
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
        let oldMeanFormants = this.#meanFormants ?? 1;
        let oldFormantsDeviation = this.#formantsDeviation ?? 1;
        this.#meanFormants = undefined;
        this.#formantsDeviation = undefined;
        this.vowelsProcessed.forEach(vowel => vowel.scaleLobanov(this.meanFormants, this.formantsDeviation));
        this.#meanFormants.x = oldMeanFormants.x + this.meanFormants.x * oldFormantsDeviation.x;
        this.#meanFormants.y = oldMeanFormants.y + this.meanFormants.y * oldFormantsDeviation.y;
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

function assertEqualNumberOfFormants(vowelArray) {
    if (vowelArray.length < 2) return;
    let formantsLength = vowelArray[0].formants.length;
    for (let i = 1; i < vowelArray.length; i++) {
        let vowel = vowelArray[i];
        if (vowel.formants.length !== formantsLength) {
            throw new Error("Unfortunately, only operations on vowels with the same number of formants are supported for now.");
        }
    }
}
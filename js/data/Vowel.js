import { POINT_SIZES } from "../const/POINT_SIZES.js";
import { VOWELS_DICTS, VOWEL_INVENTORIES } from "../const/vowel_inventories/VOWEL_INVENTORIES.js";

export default class Vowel {
    formants = [];

    get meanFormants() {
        if (!this.avg) this.calculateAverage();
        return {
            x: this.avg.x,
            y: this.avg.y
        }
    }

    get variance() {
        if (!this.avg) this.calculateAverage();
        let sumSqrDiffs = this.formants.reduce(
            (acc, formant) => {
                return {
                    x: acc.x + (formant.x - this.avg.x) ** 2,
                    y: acc.y + (formant.y - this.avg.y) ** 2
                };
            },
            {x: 0, y: 0}
        );
        return {
            x: sumSqrDiffs.x / this.formants.length,
            y: sumSqrDiffs.y / this.formants.length
        }
    }

    constructor(vowel) {
        this.language = vowel.language ?? "PL";
        let vowelDict = VOWELS_DICTS[this.language];
        let vowelInv = VOWEL_INVENTORIES[this.language];
        if (!vowel?.IPA) {
            if (vowelDict?.[vowel?.letter] !== undefined) {
                vowel.IPA = vowelInv[vowelDict[vowel.letter]].IPA;
            } else {
                console.log(VOWELS_DICTS);
                console.log(vowel);
                throw new Error("Vowel must have an IPA description");
            }
        }
        let IPA = this.IPA = vowel.IPA;
        this.letter = vowel.letter ?? IPA.broad ?? IPA.narrow;
        this.id = vowelDict[this.letter];
        this.rgb = vowel.rgb ?? "000000";
    }

    addFormants(formants) {
        this.formants.push(formants);
    }

    calculateAverage(newSize) {
        this.avg = { label: this.letter, rgb: this.rgb };
        for (let attribute of ["x", "y", "size"]) this.calculateAverageAttribute(attribute);
        this.avg.symbol = this.formants[0]?.symbol;
        this.avg.size = newSize ?? this.avg.size * 2;
    }

    calculateAverageAttribute(attribute) {
        this.avg[attribute] = 
            this.formants.reduce((acc, formant) => acc + formant[attribute], 0) 
            / this.formants.length;
    }

    scaleLobanov(mean, deviation) {
        function scaleFunction (formants) {
            formants.x = (formants.x - mean.x) / deviation.x;
            formants.y = (formants.y - mean.y) / deviation.y;
        }
        this.formants.forEach(scaleFunction);
        scaleFunction(this.avg);
    }

    toSimpleObject() {
        return {
            letter: this.letter,
            rgb: this.rgb,
            formants: this.formants.map(formants => { return {
                x: formants.x,
                y: formants.y
            }})
        };
    }

    key() {
        return this.IPA.broad // TODO take language into account
    }

    static fromSimpleObject(obj) {
        let vowel = new Vowel(obj);
        vowel.formants = obj.formants.map(formants => { 
            return {...formants, size: POINT_SIZES.USER_DATAPOINTS, rgb: vowel.rgb};
        });
        vowel.calculateAverage(POINT_SIZES.USER_CENTROIDS);
        return vowel;
    }
}
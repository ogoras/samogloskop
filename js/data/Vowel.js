import { POINT_SIZES } from "../const/POINT_SIZES.js";

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

    constructor(IPA, rgb = "000000", letter) {
        this.IPA = IPA;
        this.letter = letter ?? IPA.broad ?? IPA.narrow;
        this.rgb = rgb;
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
        let vowel = new Vowel(undefined, obj.color, obj.letter);    // TODO: figure out IPA
        vowel.formants = obj.formants.map(formants => { 
            return {...formants, size: POINT_SIZES.USER_DATAPOINTS, rgb: vowel.rgb};
        });
        vowel.calculateAverage(POINT_SIZES.USER_CENTROIDS);
        return vowel;
    }
}
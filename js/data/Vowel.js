export class Vowel {
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

    constructor(IPA, letter, color = "#000000") {
        this.IPA = IPA;
        this.letter = letter;
        this.color = color;
    }

    addFormants(formants) {
        this.formants.push(formants);
    }

    calculateAverage() {
        this.avg = { label: this.letter, color: this.color };
        for (let attribute of ["x", "y", "size"]) this.calculateAverageAttribute(attribute);
        this.avg.size *= 1.5;
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
            color: this.color,
            formants: this.formants.map(formants => { return {
                x: formants.x,
                y: formants.y
            }})
        };
    }

    static fromSimpleObject(obj) {
        let vowel = new Vowel(undefined, obj.letter, obj.color);    // TODO: figure out IPA
        vowel.formants = obj.formants.map(formants => { 
            return {...formants, size: 5, color: vowel.color};
        });
        vowel.calculateAverage();
        return vowel;
    }
}
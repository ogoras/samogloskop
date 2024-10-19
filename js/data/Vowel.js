export class Vowel {
    formants = [];

    constructor(letter, IPA, color = "#000000") {
        this.letter = letter;
        this.IPA = IPA;
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
        let vowel = new Vowel(obj.letter, undefined, obj.color);    // TODO: figure out IPA
        vowel.formants = obj.formants.map(formants => { 
            return {...formants, size: 5, color: vowel.color};
        });
        vowel.calculateAverage();
        return vowel;
    }
}
import { POINT_SIZES } from "../../const/POINT_SIZES.js";
import { VOWEL_DICTS, VOWEL_INVENTORIES, vowel, IPA_type } from "../../const/VOWEL_INVENTORIES.js";
import RecursivePartial from "../../types/RecursivePartial.js";

type xy = {
    x: number,
    y: number
}

type formant = {
    x: number,
    y: number,
    size?: number,
    rgb: string,
    [index: string]: string | number
}

export default class Vowel {
    formants: formant[] = [];
    avg?: {
        label: string,
        rgb: string,
        x?: number,
        y?: number,
        size?: number,
        [index: string]: string | number
    };
    letter: string;
    rgb: string;
    language: string;
    IPA?: Partial<IPA_type>;
    id?: number;

    get meanFormants() {
        if (!this.avg) this.calculateAverage();
        return {
            x: this.avg!.x,
            y: this.avg!.y
        }
    }

    get variance() {
        if (!this.avg) this.calculateAverage();
        const sumSqrDiffs = this.formants.reduce(
            (acc, formant) => {
                return {
                    x: acc.x + (formant.x - this.avg!.x!) ** 2,
                    y: acc.y + (formant.y - this.avg!.y!) ** 2
                };
            },
            {x: 0, y: 0}
        );
        return {
            x: sumSqrDiffs.x / this.formants.length,
            y: sumSqrDiffs.y / this.formants.length
        }
    }

    constructor(vowel?: RecursivePartial<vowel>) {
        this.language = vowel?.language ?? "PL";
        const vowelDict = VOWEL_DICTS[this.language];
        const vowelInv = VOWEL_INVENTORIES[this.language];
        if (!vowel?.IPA) {
            if (vowelDict?.[vowel?.letter ?? ""] !== undefined) {
                vowel ??= {};
                const IPA = vowelInv?.[vowelDict?.[vowel.letter ?? ""] ?? 0]?.IPA;
                if (IPA) vowel.IPA = IPA;
            } else {
                console.log(VOWEL_DICTS);
                console.log(vowel);
                throw new Error("Vowel must have an IPA description");
            }
        }
        const IPA = vowel.IPA;
        if (IPA) this.IPA = IPA;
        const letter = vowel?.letter ?? IPA?.broad ?? IPA?.narrow;
        if (letter) this.letter = letter;
        else throw new Error("Vowel must have a letter description");

        const id = vowelDict?.[this.letter ?? ""];
        if (id) this.id = id;
        this.rgb = vowel.rgb ?? "000000";
    }

    addFormants(...formants: formant[]) {
        this.formants.push(...formants);
    }

    calculateAverage(newSize?: number) {
        this.avg = { label: this.letter, rgb: this.rgb };
        for (let attribute of ["x", "y", "size"]) this.calculateAverageAttribute(attribute);
        this.avg.size = newSize ?? this.avg.size! * 2;
        if (!this.avg) throw new Error("No formants to calculate average from");
    }

    calculateAverageAttribute(attribute: string) {
        if (!this.avg) throw new Error(`${this}.avg is not defined to calculate average ${attribute} from`);
        this.avg[attribute] = 
            this.formants.reduce((acc, formant) => acc + (formant[attribute] as number), 0) 
            / this.formants.length;
    }

    scaleLobanov(mean: xy, deviation: xy) {
        function scaleFunction (formants: xy) {
            formants.x = (formants.x - mean.x) / deviation.x;
            formants.y = (formants.y - mean.y) / deviation.y;
        }
        this.formants.forEach(scaleFunction);
        if (!this.avg?.x || !this.avg?.y) throw new Error("No average formants to scale!");
        scaleFunction(this.avg as xy);
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
        return this.IPA?.broad // TODO take language into account
    }

    static fromSimpleObject(obj : {letter: string, formants: xy[]}) {
        const vowel = new Vowel(obj);
        vowel.formants = obj.formants.map(formants => { 
            return {...formants, size: POINT_SIZES.USER_DATAPOINTS, rgb: vowel.rgb};
        });
        vowel.calculateAverage(POINT_SIZES.USER_CENTROIDS);
        return vowel;
    }
}
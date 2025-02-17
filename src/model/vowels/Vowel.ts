import { POINT_SIZES } from "../../const/POINT_SIZES.js";
import { VOWEL_DICTS, VOWEL_INVENTORIES, vowel, IPA_type } from "../../const/VOWEL_INVENTORIES.js";
import RecursivePartial from "../../types/RecursivePartial.js";
import xy from "../../types/xy.js"

import type * as math_node from 'mathjs';
declare const math: typeof math_node;

export type formant = {
    x: number,
    y: number,
    size?: number,
    rgb?: string,
    identified?: boolean | undefined,
    [index: string]: string | number | boolean | undefined
}

type ellipse = {
    x: number,
    y: number,
    rx: number,
    ry?: number,
    angle?: number,
}

const CONFIDENCE_FACTOR = Math.sqrt(5.911); // 95% confidence interval for 2D normal distribution

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
    id: number;
    #confidenceEllipse: ellipse | undefined;

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

    get confidenceEllipse() {
        if (this.#confidenceEllipse) return this.#confidenceEllipse;
        if (!this.avg) this.calculateAverage();
        const variance = this.variance;
        const mean = this.meanFormants;
        const covariance = this.formants.reduce(
            (acc, formant) => {
                return acc + (formant.x - mean.x!) * (formant.y - mean.y!);
            },
            0
        ) / this.formants.length;
        const covarianceMatrix = [[variance.x, covariance], [covariance, variance.y]];
        const eigenvectors = math.eigs(covarianceMatrix).eigenvectors;
        if (eigenvectors.length < 2) throw new Error("Could not calculate eigenvectors for confidence matrix");
        const rx = Math.sqrt(Math.abs(eigenvectors[0]!.value as number)) * CONFIDENCE_FACTOR;
        if (isNaN(rx)) {
            console.log(this);
            throw new Error(`rx is NaN`);
        }
        const ry = Math.sqrt(Math.abs(eigenvectors[1]!.value as number)) * CONFIDENCE_FACTOR;
        if (isNaN(ry)) {
            throw new Error(`ry is NaN`);
        }
        if (isNaN(ry)) throw new Error(`eigenvectors is ${eigenvectors}`);
        const eigenvectorX = eigenvectors[0]!.vector as number[];
        if (eigenvectorX.length < 2) throw new Error("Eigenvector X is not 2D");
        const angle = Math.atan2(eigenvectorX[1]!, eigenvectorX[0]!) * 180 / Math.PI;
        this.#confidenceEllipse = {x: mean.x!, y: mean.y!, rx, ry, angle};
        return this.#confidenceEllipse
    }

    constructor(vowel?: RecursivePartial<vowel>) {
        this.language = vowel?.language ?? "PL";
        const vowelDict = VOWEL_DICTS[this.language];
        if (!vowelDict) throw new Error(`Language ${this.language} unsupported`)
        const vowelInv = VOWEL_INVENTORIES[this.language];
        if (!vowel?.IPA) {
            if (vowelDict[vowel?.letter ?? ""] !== undefined) {
                vowel ??= {};
                const IPA = vowelInv?.[vowelDict[vowel.letter ?? ""] ?? 0]?.IPA;
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

        const id = vowelDict[this.letter];
        if (id !== undefined) this.id = id;
        else {
            console.log(vowelDict);
            throw new Error(`Could not find vowel ${this.letter} in language ${this.language}`);
        }
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

        this.#confidenceEllipse = undefined;
    }

    scaleByFactor(factor: number) {
        function scaleFunction (formants: xy) {
            formants.x *= factor;
            formants.y *= factor;
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
        return this.IPA?.broad ?? this.letter
    }

    reset() {
        this.formants = [];
        delete this.avg;
        this.#confidenceEllipse = undefined;
    }

    static fromSimpleObject(obj : {letter: string, formants: xy[], [index: string]: any}) {
        const vowel = new Vowel(obj);
        vowel.formants = obj.formants.map(formants => { 
            return {...formants, size: POINT_SIZES.USER_DATAPOINTS, rgb: vowel.rgb};
        });
        vowel.calculateAverage(POINT_SIZES.USER_CENTROIDS);
        return vowel;
    }
}
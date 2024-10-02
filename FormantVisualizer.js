import { soundToFormant } from './sound_to_formant/formant.js';
import { ScatterPlot } from './visualization/ScatterPlot.js';

let vowels = {
    a : { F1: 800, F2: 1300, color: "rgb(255, 0, 0)" },
    e : { F1: 660, F2: 1600, color: "rgb(250, 165, 0)" },
    i : { F1: 300, F2: 2300, color: "rgb(0, 255, 0)" },
    o : { F1: 580, F2: 900, color: "rgb(255, 0, 255)" },
    u : { F1: 320, F2: 630, color: "rgb(0, 0, 255)"  },
    y : { F1: 480, F2: 1750, color: "rgb(150, 75, 0)" }
}

export class FormantVisualizer {
    scatterPlot = new ScatterPlot("formants", true);

    constructor(sampleRate) {
        this.sampleRate = sampleRate;
        this.scatterPlot.addSeries(Object.entries(vowels).map(this.vowelToScatterPlotEntry.bind(this)));
        this.scatterPlot.addSeries([], true, 20);
    }

    vowelToScatterPlotEntry(vowel) {
        let [key, value] = vowel;
        // let { x, y } = this.formantsToXY(value);
        return {
            label: key,
            x : value.F2,
            y : value.F1,
            color: value.color
        };
    }

    // formantsToXY(formants) {
    //     let F1 = formants.F1;
    //     let F2 = formants.F2;
    //     F1 /= 2;
    //     F2 -= 400;
    //     F2 /= 4;
    //     let x = 600 - F2;
    //     let y = F1;
    //     return { x: x / 600 * this.scatterPlot.width, y: y / 600 * this.scatterPlot.height };
    // }

    feed(samples) {
        const formants = soundToFormant([...samples], this.sampleRate);
        for (let i = 0; i < formants.length; i++) {
            if (formants[i].formant.length >= 2) {
                this.scatterPlot.feed({
                    y: formants[i].formant[0].frequency,
                    x: formants[i].formant[1].frequency
                });
            }
        }
    }
}
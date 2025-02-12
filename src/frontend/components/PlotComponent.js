import Component from "./Component.js";
import ScatterPlot from "../visualization/scatter_plot/ScatterPlot.js"
import { VOWEL_INVENTORIES, VOWEL_DICTS } from '../../const/VOWEL_INVENTORIES.js';
import { POINT_SIZES } from '../../const/POINT_SIZES.js';

export default class PlotComponent extends Component {
    constructor(parent, formantCount, unit) {
        super();
        this.parent = parent;
        this.formantCount = formantCount;
        this.scatterPlot = new ScatterPlot("formants", true, unit);

        const vowelInv = VOWEL_INVENTORIES.PL;
        for (let i = 0; i < vowelInv.length; i++) {
            const vowel = vowelInv[i];
            const ids = this.scatterPlot.appendGroup({ 
                nested: true, 
                formatting: { rgb: vowel.rgb },
                onClick: this.parent.vowelClicked ? () => this.parent.vowelClicked(vowel) : undefined
            }, 0);
            this.scatterPlot.appendGroup({ formatting: {
                text: vowel.letter,
                size: POINT_SIZES.USER_DATAPOINTS,
                opacity: "FF",
            }}, ids);
            this.scatterPlot.appendGroup({}, ids);  // ellipse
            this.scatterPlot.appendGroup({ formatting: {
                text: vowel.letter,
                size: POINT_SIZES.USER_CENTROIDS,
                glow: true
            }}, ids);
        }
        this.scatterPlot.appendGroup({ capacity: this.formantCount, growSize: true, formatting: {
            size: POINT_SIZES.TRAIL,
            opacity: "80"
        }}, 1);
        this.scatterPlot.appendGroup({ formatting: {
            size: POINT_SIZES.CURRENT
        }}, 1);

        this.scatterPlot.addSeriesFormatting({ fontWeight: 700, serif: true }, 0);
    }

    saveFormants(formants, vowelId = 0) {
        this.scatterPlot.feed(formants, [0, vowelId, 0]);
    }

    vowelEllipse(ellipse, vowelId = 0) {
        this.scatterPlot.addEllipse(ellipse, [0, vowelId, 1]);
    }

    vowelCentroid(vowel) {
        this.scatterPlot.feed(vowel.avg, [0, vowel.id, 2]);
    }

    feed(formants, rescale = true) {
        for (let formant of formants) {
            this.scatterPlot.feed(formant, [-1, 0], rescale);
        }
    }

    feedSmoothed(formants, rescale = true) {
        this.scatterPlot.setSeriesSingle(formants, [-1, 1], 50, rescale);
    }

    removeNativeVowel(vowel) {
        const vowelDict = VOWEL_DICTS.PL;
        this.scatterPlot.removeAllFromGroup([0, vowelDict[vowel.letter]]);
    }

    disableNativeClickability() {
        const vowelInv = VOWEL_INVENTORIES.PL;
        for (let i = 0; i < vowelInv.length; i++) {
            this.scatterPlot.setGroupClickability(false, [0, i]);
        }
    }

    restore() {
        this.scatterPlot.restore();
    }

    destroy() {
        super.destroy?.();
        this.scatterPlot.destroy();
    }
}
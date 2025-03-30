import Component from "./Component.js";
import ScatterPlot from "../visualization/scatter_plot/ScatterPlot.js"
import { VOWEL_INVENTORIES, VOWEL_DICTS } from '../../const/VOWEL_INVENTORIES.js';
import { POINT_SIZES } from '../../const/POINT_SIZES.js';
import Vowel from "../../model/vowels/Vowel.js";

export default class PlotComponent extends Component {
    #datasetCount = 1;

    constructor(parent, formantCount, unit, twoUserForeignDatasets = false) {
        super();
        this.parent = parent;
        this.formantCount = formantCount;
        this.twoUserForeignDatasets = twoUserForeignDatasets;
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

    addVowelMeasurements(vowels, index, symbol, {pointOpacity = "80", ellipseOpacity0, ellipseOpacity1}, initiallyVisible = [true, true, true], formatting = {}) {
        if (!symbol) throw new Error("Symbol must be provided.");
        if (!index) throw new Error("Index must be provided.");
        const vowelInv = VOWEL_INVENTORIES[vowels.language];
        this.scatterPlot.insertGroup({
            formatting: { symbol, ...formatting },
            nested: true
        }, index);
        for (let i = 0; i < vowelInv.length; i++) {
            const vowel = vowels.getVowelByLetter(new Vowel(vowelInv[i]).letter);
            const ids = this.scatterPlot.appendGroup({
                nested: true,
                formatting: { rgb: vowel.rgb },
                onClick: this.parent.vowelClicked ? () => this.parent.vowelClicked(vowel) : undefined
            }, index);
            
            const pointCloudIds = this.scatterPlot.appendGroup({
                formatting: {
                    size: POINT_SIZES.USER_DATAPOINTS * 0.7,
                    text: vowel.letter,
                    opacity: pointOpacity,
                }
            }, ids, vowels.getSingleMeasurements(vowel.letter));

            this.scatterPlot.setSeriesVisibility(initiallyVisible[0], pointCloudIds);

            const ellipseIds = this.scatterPlot.appendGroup({}, ids);
            this.scatterPlot.addEllipse({
                ...vowel.confidenceEllipse,
                ellipseOpacity0,
                ellipseOpacity1
            }, ellipseIds);
            
            this.scatterPlot.setSeriesVisibility(initiallyVisible[1], ellipseIds);

            const centroidIds = this.scatterPlot.appendGroup({
                formatting: {
                    size: POINT_SIZES.VOWEL_CENTROID * 0.7,
                    text: vowel.letter,
                    glow: true
                }
            }, ids, vowels.getCentroids(vowel.letter));

            this.scatterPlot.setSeriesVisibility(initiallyVisible[2], centroidIds);
        }
        this.#datasetCount++
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

    setNativeVowelsVisiblity(visiblity) {
        this.scatterPlot.getGroup(0).forEach(group => group.forEach((subgroup, index) => subgroup.g.style("display", visiblity[index] ? "block" : "none")));
    }

    selectForeignVowel(vowelId) {
        const MAX = this.twoUserForeignDatasets ? 4 : 3;
        for (let i = 1; i <= MAX; i++) {
            this.scatterPlot.getGroup(i).forEach((group, index) => {
                if (index === vowelId) return;
                group.g.style("display", "none")
            });
        }
    }

    showAllForeign() {
        const MAX = this.twoUserForeignDatasets ? 4 : 3;
        for (let i = 1; i <= MAX; i++) {
            this.scatterPlot.getGroup(i).forEach((group, index) => {
                group.g.style("display", "block")
            });
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
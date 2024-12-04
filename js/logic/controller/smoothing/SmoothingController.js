import RenderController from "../render/RenderController.js";
import SpeakerVowels from "../../../data/vowels/SpeakerVowels.js";
import Buffer from "../../util/Buffer.js";
import { POINT_SIZES } from "../../../const/POINT_SIZES.js";

const minimumSmoothingCount = 20;
export default class SmoothingController extends RenderController {
    constructor() {
        super();
        if (this.constructor === SmoothingController) {
            throw new TypeError(`Abstract class "${this.constructor.name}" cannot be instantiated directly.`);
        }
    }

    init(prev) {
        this.initStart(prev);
        this.nativeVowels = prev.nativeVowels ?? this.lsm.nativeVowels ?? new SpeakerVowels();
        this.initFinalAndRun(prev);
    }

    initStart(prev) {
        this.smoothedFormantsBuffer = prev.smoothedFormantsBuffer ?? new Buffer(minimumSmoothingCount);
        super.initStart(prev);
    }

    getSmoothedFormants() {
        const formantsBuffer = this.formantsBuffer;
        const smoothedFormantsBuffer = this.smoothedFormantsBuffer;
        if (formantsBuffer.length < minimumSmoothingCount) return undefined;
        const ratio = 0.5;
        let weightSum = 0;
        let xSum = 0;
        let ySum = 0;
        let weight = 1;
        for (let formants of formantsBuffer.buffer) {
            xSum += formants.F2 * weight;
            ySum += formants.F1 * weight;
            weightSum += weight;
            weight *= ratio;
        }
        const smoothedFormants = {
            x: xSum / weightSum,
            y: ySum / weightSum,
            size: POINT_SIZES.CURRENT,
        };
        // this.formantsToSave can be ignored
        this.formantsToSave = smoothedFormantsBuffer.push(smoothedFormants);
        if (this.formantsToSave) this.formantsToSave.size = POINT_SIZES.USER_DATAPOINTS;
        return smoothedFormants;
    }

    processFormants(rescalePlot = true) {
        const formants = this.formants;
        const stats = this.intensityStats;
        const nativeVowels = this.nativeVowels;      

        if (!stats.detectSpeech()) {
            this.formantsBuffer.clear();
            this.smoothedFormantsBuffer.clear();
            return false;
        }
        
        const formantPoints = formants
            .filter((formants) => formants.formant.length >= 2)
            .map((formants) => {
                const point = {x: formants.formant[1].frequency, y: formants.formant[0].frequency};
                nativeVowels.scale(point);
                return point;
            });
        const formantsSmoothed = nativeVowels.scale(this.getSmoothedFormants());
        this.view.feedSmoothed(formantsSmoothed, false);
        this.view.feedFormants(formantPoints, false);

        return true;
    }
}
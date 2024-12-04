import RenderController from "../render/RenderController.js";
import SpeakerVowels from "../../../data/vowels/SpeakerVowels.js";
import Buffer from "../../util/Buffer.js";
import { POINT_SIZES } from "../../../const/POINT_SIZES.js";

const minimumSmoothingCount = 20;
export default class SmoothingController extends RenderController {
    init(prev) {
        this.smoothedFormantsBuffer = prev.smoothedFormantsBuffer ?? new Buffer(minimumSmoothingCount);
        this.initStart(prev);
        this.userVowels = prev.userVowels ?? this.lsm.userVowels ?? new SpeakerVowels();
        this.initFinalAndRun(prev);
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
            //color: !userVowels.isDone() ? userVowels.currentVowel.rgb : "black"
        };
        // this.formantsToSave can be ignored
        this.formantsToSave = smoothedFormantsBuffer.push(smoothedFormants);
        if (this.formantsToSave) this.formantsToSave.size = POINT_SIZES.USER_DATAPOINTS;
        return smoothedFormants;
    }
}
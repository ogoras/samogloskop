import SpeakerVowels from "../../../../data/vowels/SpeakerVowels.js";
import { POINT_SIZES } from "../../../../const/POINT_SIZES.js";
import Buffer from "../../../util/Buffer.js";
import nextController from "../../nextController.js";
import RenderController from "./RenderController.js";

const SUBSTATES = {
    "WAITING": 0,
    "GATHERING": 1,
    "GATHERED": 2
}

export const minimumSmoothingCount = 20;
export default class GatheringVowelsController extends RenderController {
    smoothedFormantsBuffer = new Buffer(minimumSmoothingCount);

    init(prev) {
        this.substate = SUBSTATES.WAITING;
        this.initStart(prev);
        this.userVowels = prev.userVowels ?? new SpeakerVowels();
        this.initFinalAndRun(prev);
    }

    renderLoop() {
        if (super.renderLoop()) return true;

        const samples = this.samples;
        const formants = this.formants;
        const stats = this.intensityStats;
        const statsUpdated = this.statsUpdated;

        switch(this.substate) {
            case SUBSTATES.WAITING:
                if (statsUpdated && stats.detectSpeech()) {
                    this.substate = SUBSTATES.GATHERING;
                    this.view.feed(samples, {speechDetected: true});
                    this.formantsBuffer.clear();
                    this.smoothedFormantsBuffer.clear();
                }
                else this.view.feed(samples);
                break;
            case SUBSTATES.GATHERING:
                const userVowels = this.userVowels;

                if (!stats.detectSpeech()) {
                    this.formantsBuffer.clear();
                    this.smoothedFormantsBuffer.clear();
                    this.substate = SUBSTATES.WAITING;
                    this.view.feed(samples, {speechDetected: false});
                    break;
                }
                const formantPoints = formants
                    .filter((formants) => formants.formant.length >= 2)
                    .map((formants) => {
                        const point = {x: formants.formant[1].frequency, y: formants.formant[0].frequency};
                        userVowels.scale(point);
                        return point;
                    });
                const formantsSmoothed = userVowels.scale(this.getSmoothedFormants());
                const formantsSaved = this.formantsToSave;
                userVowels.addFormants(this.formantsToSave);
                delete this.formantsToSave;
                if (userVowels.isVowelGathered()) {
                    const vowel = userVowels.saveVowel();
                    this.substate = SUBSTATES.GATHERED;
                    this.view.feed(samples, {
                        vowel,
                        formantsSaved,
                        formantsSmoothed,
                        formants: formantPoints,
                        vowelGathered: true
                    });
                    if (userVowels.isDone()) {
                        userVowels.scaleLobanov();
                        this.lsm.userVowels = userVowels;
                        this.sm.advance();
                        nextController(this);
                        return;
                    }
                }
                else {
                    this.view.feed(samples, {formantsSaved, formantsSmoothed, formants: formantPoints});
                }
                break;
            case SUBSTATES.GATHERED:
                // wait for 1 second of silence
                const silenceRequired = 1;
                if (statsUpdated) {
                    const length = stats.silenceDuration;
                    const progress = length / silenceRequired;
                    if (length >= silenceRequired) {
                        this.substate = SUBSTATES.WAITING;
                        this.view.feed(samples, {
                            progress: 1,
                            speechDetected: false
                        });
                        this.smoothedFormantsBuffer.clear();
                    }
                    else this.view.feed(samples, {progress});
                }
                break;
            default:
                throw new Error(`Invalid substate in ${this.constructor.name}: ${this.substate}`);
        }

        requestAnimationFrame(this.renderLoop.bind(this));
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
        this.formantsToSave = smoothedFormantsBuffer.push(smoothedFormants)
        if (this.formantsToSave) this.formantsToSave.size = POINT_SIZES.USER_DATAPOINTS;
        return smoothedFormants;
    }
}
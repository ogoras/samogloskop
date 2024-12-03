import { POINT_SIZES } from "../../../const/POINT_SIZES.js";
import nextController from "../nextController.js";
import SmoothingController from "./SmoothingController.js";

const SUBSTATES = {
    "WAITING": 0,
    "GATHERING": 1,
    "GATHERED": 2
}

export default class GatheringVowelsController extends SmoothingController {
    init(prev) {
        this.substate = SUBSTATES.WAITING;
        super.init(prev);
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
                        return false;
                    }
                }
                else {
                    this.view.feed(samples, {formantsSaved, formantsSmoothed, formants: formantPoints});
                    // TODO: get rid of this view.feed method and replace it with more specific methods
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

        return false;
    }
}
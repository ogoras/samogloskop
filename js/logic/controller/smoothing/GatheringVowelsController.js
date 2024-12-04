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
        const view = this.view;

        view.feed(samples);

        switch(this.substate) {
            case SUBSTATES.WAITING:
                if (statsUpdated && stats.detectSpeech()) {
                    this.substate = SUBSTATES.GATHERING;

                    this.formantsBuffer.clear();
                    this.smoothedFormantsBuffer.clear();
                    
                    view.speechDetected = true;
                }
                break;
            case SUBSTATES.GATHERING:
                const userVowels = this.userVowels;

                if (!stats.detectSpeech()) {
                    this.substate = SUBSTATES.WAITING;

                    this.formantsBuffer.clear();
                    this.smoothedFormantsBuffer.clear();
                    
                    view.speechDetected = false;
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
                view.feedFormants(formantPoints);
                view.feedSmoothed(formantsSmoothed);
                view.saveFormants(formantsSaved);

                if (userVowels.isVowelGathered()) {
                    this.substate = SUBSTATES.GATHERED;

                    const vowel = userVowels.saveVowel();
                    view.feedVowel(vowel);
                    view.vowelGathered = true;
                    if (userVowels.isDone()) {
                        userVowels.scaleLobanov();
                        this.lsm.userVowels = userVowels;
                        this.sm.advance();
                        nextController(this);
                        return false;
                    }
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

                        this.smoothedFormantsBuffer.clear();

                        view.progress = 1;
                        view.speechDetected = false;
                    }
                    else view.progress = progress;
                }
                break;
            default:
                throw new Error(`Invalid substate in ${this.constructor.name}: ${this.substate}`);
        }

        requestAnimationFrame(this.renderLoop.bind(this));

        return false;
    }
}
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

        const stats = this.intensityStats;
        const statsUpdated = this.statsUpdated;
        const view = this.view;

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
                const nativeVowels = this.nativeVowels;

                if (!this.processFormants()) {
                    this.substate = SUBSTATES.WAITING;
                    view.speechDetected = false;
                    break;
                }
                
                const formantsSaved = this.formantsToSave;
                nativeVowels.addFormants(this.formantsToSave);
                delete this.formantsToSave;
                view.feedSaved(formantsSaved);

                if (nativeVowels.isVowelGathered()) {
                    this.substate = SUBSTATES.GATHERED;

                    const vowel = nativeVowels.saveVowel();
                    view.feedVowel(vowel);
                    view.vowelGathered = true;
                    if (nativeVowels.isDone()) {
                        nativeVowels.scaleLobanov();
                        this.lsm.nativeVowels = nativeVowels;
                        this.sm.advance();
                        nextController(this);
                        return false;
                    }
                }
                break;
            case SUBSTATES.GATHERED:
                // wait for 1 second of silence
                if (this.waitFor(1)) {
                    this.substate = SUBSTATES.WAITING;
                    this.smoothedFormantsBuffer.clear();
                    view.speechDetected = false;
                }
                break;
            default:
                throw new Error(`Invalid substate in ${this.constructor.name}: ${this.substate}`);
        }

        requestAnimationFrame(this.renderLoop.bind(this));

        return false;
    }
}
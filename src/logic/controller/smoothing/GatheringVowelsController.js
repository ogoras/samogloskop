import nextController from "../nextController.js";
import SmoothingController from "./SmoothingController.js";

const SUBSTATES = {
    "WAITING": 0,
    "GATHERING": 1,
    "GATHERED": 2
}

export default class GatheringVowelsController extends SmoothingController {
    init(prev) {
        this.vowelsBeingGathered = "nativeVowels";
        prev.lsm[this.vowelsBeingGathered] = undefined;
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
                    this.view.secondaryProgress = 0;
                    
                    view.speechDetected = true;
                }
                break;
            case SUBSTATES.GATHERING:
                const vowelsBeingGathered = this[this.vowelsBeingGathered];

                if (!this.processFormants()) {
                    this.substate = SUBSTATES.WAITING;
                    view.speechDetected = false;
                    break;
                }
                
                const formantsSaved = this.formantsToSave;
                const progress = vowelsBeingGathered.addFormants(this.formantsToSave);
                delete this.formantsToSave;
                view.feedSaved(formantsSaved);

                if (vowelsBeingGathered.isVowelGathered()) {
                    view.progress = 1;
                    this.substate = SUBSTATES.GATHERED;

                    const vowel = vowelsBeingGathered.saveVowel();
                    view.feedVowel(vowel);
                    view.vowelGathered = true;
                    if (vowelsBeingGathered.isDone()) {
                        if (this.sm.state.is("GATHERING_NATIVE")) {
                            vowelsBeingGathered.scaleLobanov();
                        }
                        this.lsm[this.vowelsBeingGathered] = vowelsBeingGathered;
                        this.#next();
                        return false;
                    }
                }
                else view.progress = progress;
                break;
            case SUBSTATES.GATHERED:
                // wait for 1 second of silence
                if (this.waitFor(1)) {
                    this.substate = SUBSTATES.WAITING;
                    this.smoothedFormantsBuffer.clear();
                    this.view.secondaryProgress = 0;
                    view.speechDetected = false;
                }
                break;
            default:
                throw new Error(`Invalid substate in ${this.constructor.name}: ${this.substate}`);
        }

        requestAnimationFrame(this.renderLoop.bind(this));

        return false;
    }
    
    #next() {
        this.sm.advance();
        if (this.sm.state.is("DONE")) {
            this.view.destroy();
        }
        nextController(this);
    }
}
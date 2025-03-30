import nextController from "../nextController.js";
import SmoothingController from "./SmoothingController.js";
import GatheringNativeView from "../../../frontend/view/recording/gathering/GatheringNativeView.js";

const SUBSTATES = {
    "WAITING": 0,
    "GATHERING": 1,
    "GATHERED": 2
}

export default class GatheringVowelsController extends SmoothingController {
    vowelsBeingGathered = "nativeVowels";

    init(prev) {
        if (!prev.sm.onTempState) prev.lsm[this.vowelsBeingGathered] = undefined;
        this.substate = SUBSTATES.WAITING;
        super.init(prev);
    }

    initView(prev) {
        this.view = new GatheringNativeView(this, this.recorder, prev?.view);
    }

    renderLoop() {
        if (super.renderLoop()) return true;

        const stats = this.intensityStats;
        const statsUpdated = this.statsUpdated;
        const view = this.view;

        this.formantsWereSavedThisFrame = false;

        switch(this.substate) {
            case SUBSTATES.WAITING:
                if (statsUpdated && stats.detectSpeech()) {
                    this.speechDetectedInWaiting();
                }
                break;
            case SUBSTATES.GATHERING:
                if (!this.processFormants()) {
                    this.substate = SUBSTATES.WAITING;
                    view.speechDetected = false;
                    this.speechDetected = false;
                    break;
                }
                
                if (!this.speechStillDetectedInGathering()) return false;
                break;
            case SUBSTATES.GATHERED:
                // wait for 1 second of silence
                if (this.waitFor(1)) {
                    this.afterGathered();
                }
                break;
            default:
                throw new Error(`Invalid substate in ${this.constructor.name}: ${this.substate}`);
        }

        requestAnimationFrame(this.renderLoop.bind(this));

        return false;
    }
    
    #next() {
        this.stopCountingTime();

        this.sm.advance();
        if (this.sm.state.is("DONE")) {
            this.view.destroy();
        }
        nextController(this);
    }

    speechDetectedInWaiting() {
        this.substate = SUBSTATES.GATHERING;

        this.formantsBuffer.clear();
        this.smoothedFormantsBuffer.clear();
        this.view.secondaryProgress = 0;
        
        this.view.speechDetected = true;
        this.speechDetected = true;
    }

    confirmAllVowels() {
        const vowelsBeingGathered = this[this.vowelsBeingGathered];
        if (this.sm.state.is("GATHERING_NATIVE")) {
            vowelsBeingGathered.scaleLobanov();
        }
        this.lsm[this.vowelsBeingGathered] = vowelsBeingGathered;
        this.#next();
    }

    onAllVowelsGathered() {
        this.confirmAllVowels();
        return false;
    }

    speechStillDetectedInGathering() {
        const view = this.view;
        const vowelsBeingGathered = this[this.vowelsBeingGathered];

        const formantsSaved = this.formantsToSave;
        this.formantsWereSavedThisFrame = formantsSaved !== null;
        const progress = vowelsBeingGathered.addFormants(this.formantsToSave);
        delete this.formantsToSave;
        view.feedSaved?.(formantsSaved);

        if (vowelsBeingGathered.isVowelGathered()) {
            view.progress = 1;
            this.substate = SUBSTATES.GATHERED;

            const vowel = vowelsBeingGathered.saveVowel();
            view.feedVowel?.(vowel);
            view.vowelGathered = true;
            if (vowelsBeingGathered.isDone()) {
                return this.onAllVowelsGathered();
            }
        }
        else {
            view.progress = progress;
        }

        return true;
    }

    afterGathered() {
        this.substate = SUBSTATES.WAITING;
        this.smoothedFormantsBuffer.clear();
        this.view.secondaryProgress = 0;
        this.view.speechDetected = false;
        this.speechDetected = false;
    }
}
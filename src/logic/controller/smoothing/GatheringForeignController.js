import ForeignRecordings from '../../../model/recordings/ForeignRecordings.js';
import GatheringVowelsController from "./GatheringVowelsController.js";
import GatheringForeignView from "../../../frontend/view/recording/gathering/GatheringForeignView.js";
import SpeakerVowels from '../../../model/vowels/SpeakerVowels.js';

export default class GatheringForeignController extends GatheringVowelsController {
    async init(prev) {
        this.allGathered = false;
        this.repeat = prev.sm.state.is("GATHERING_FOREIGN_REPEAT");
        if (this.repeat) {
            this.vowelsBeingGathered = "foreignRepeat";
        } else if (prev.lsm.foreignInitial) {
            this.vowelsBeingGathered = "foreignCurrent";
        } else {
            this.vowelsBeingGathered = "foreignInitial";
        }
        super.init(prev);

        if (!this.repeat && this.vowelsBeingGathered === "foreignCurrent") {
            this.foreignCurrent = new SpeakerVowels("EN");
        }

        if (this.repeat) {
            this.view.hideTimer();
        }

        this.disableMic();
        this.englishRecordings = prev.englishRecordings ?? await ForeignRecordings.create("EN");
        this.view.initializeRecordings(this.englishRecordings);
    }

    initView(prev) {
        this.view = new GatheringForeignView(this, this.recorder, prev?.view);
    }

    initTimer(prev) {
        if (!this.repeat) {
            super.initTimer(prev);
        }
    }

    speechDetectedInWaiting() {
        super.speechDetectedInWaiting();

        this.userRecordingSamples = [...this.samplesThisFrame];
        this.samplesThisFrame = [];
    }

    speechStillDetectedInGathering() {
        const ret = super.speechStillDetectedInGathering();

        this.userRecordingSamples.push(...this.samplesThisFrame);
        this.samplesThisFrame = [];
        if (this.formantsWereSavedThisFrame) {
            this.userSavedSamples.push(...this.userRecordingSamples);
            this.userRecordingSamples = [];
        }

        return ret;
    }

    onAllVowelsGathered() {
        this.allGathered = true;
        return true;
    }

    confirmAllVowels() {
        this.breakRenderLoop();
        return super.confirmAllVowels();
    }
    
    newVowelRecording() {
        this.userSavedSamples = [];
        const vowel = this[this.vowelsBeingGathered].nextVowel();
        this.currentEntry = this.englishRecordings.getRandomEntryForVowel(vowel.letter);
        return this.currentEntry;
    }

    resetVowel() {
        this.userSavedSamples = [];
        this[this.vowelsBeingGathered].resetVowel(undefined, true);

        this.allGathered = false;
    }
}
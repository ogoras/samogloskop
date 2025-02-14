import ForeignRecordings from '../../../model/recordings/ForeignRecordings.js';
import GatheringVowelsController from "./GatheringVowelsController.js";
import GatheringForeignView from "../../../frontend/view/recording/gathering/GatheringForeignView.js";

export default class GatheringForeignController extends GatheringVowelsController {
    async init(prev) {
        this.repeat = prev.sm.state.is("GATHERING_FOREIGN_REPEAT");
        this.vowelsBeingGathered = this.repeat ? "foreignRepeat" : "foreignInitial";
        super.init(prev);

        this.disableMic();
        this.englishRecordings = prev.englishRecordings ?? await ForeignRecordings.create("EN");
        this.view.initializeRecordings(this.englishRecordings);
    }

    initView(prev) {
        this.view = new GatheringForeignView(this, this.recorder, prev?.view);
    }

    speechDetectedInWaiting() {
        super.speechDetectedInWaiting();

        this.userRecordingSamples = this.samplesThisFrame;
        this.samplesThisFrame = null;
    }

    speechStillDetectedInGathering() {
        const ret = super.speechStillDetectedInGathering();

        this.userRecordingSamples.push(...this.samplesThisFrame);
        this.samplesThisFrame = null;
        if (this.formantsWereSavedThisFrame) {
            this.userSavedSamples.push(...this.userRecordingSamples);
            this.userRecordingSamples = [];
        }

        return ret;
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
    }
}
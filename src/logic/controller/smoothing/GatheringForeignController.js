import ForeignRecordings from '../../../model/recordings/ForeignRecordings.js';
import GatheringVowelsController from "./GatheringVowelsController.js";

export default class GatheringForeignController extends GatheringVowelsController {
    async init(prev) {
        this.repeat = prev.sm.state.is("GATHERING_FOREIGN_REPEAT");
        this.vowelsBeingGathered = this.repeat ? "foreignRepeat" : "foreignInitial";
        super.init(prev);

        this.disableMic();
        this.englishRecordings = prev.englishRecordings ?? await ForeignRecordings.create("EN");
        this.view.initializeRecordings(this.englishRecordings);
    }
    
    newVowelRecording() {
        const vowel = this[this.vowelsBeingGathered].nextVowel();
        this.currentEntry = this.englishRecordings.getRandomEntryForVowel(vowel.letter);
        return this.currentEntry;
    }
}
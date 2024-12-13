import ForeignRecordings from '../../../model/recordings/ForeignRecordings.js';
import GatheringVowelsController from "./GatheringVowelsController.js";
export default class GatheringForeignController extends GatheringVowelsController {
    async init(prev) {
        this.repeat = prev.sm.state.is("GATHERING_FOREIGN_REPEAT");
        const vowelsBeingGathered = this.repeat ? "foreignRepeat" : "foreignInitial";
        prev.lsm[vowelsBeingGathered] = undefined;
        super.init(prev);
        this.vowelsBeingGathered = vowelsBeingGathered;
        this.disableMic();
        this.englishRecordings = prev.englishRecordings ?? await ForeignRecordings.create("EN");
        this.view.initializeRecordings(this.englishRecordings);
    }
    disableMic() {
        this.recorder.stopRecording();
        this.recorder.dump();
        this.view.disabled = true;
    }
    enableMic() {
        this.view.disabled = false;
    }
    newVowelRecording() {
        const vowel = this[this.vowelsBeingGathered].nextVowel();
        this.currentEntry = this.englishRecordings.getRandomEntryForVowel(vowel.letter);
        return this.currentEntry;
    }
}

import ForeignRecordings from '../../../model/recordings/ForeignRecordings.js';
import GatheringVowelsController from "./GatheringVowelsController.js";

export default class GatheringForeignController extends GatheringVowelsController {
    async init(prev) {
        const vowelsBeingGathered = prev.sm.state.is("GATHERING_FOREIGN_INITIAL") ? "foreignInitial" : "foreignRepeat";
        prev.lsm[vowelsBeingGathered] = undefined;
        super.init(prev);
        this.vowelsBeingGathered = vowelsBeingGathered;

        this.disableMic();
        this.englishRecordings = await ForeignRecordings.create("EN");
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
import RenderController from './RenderController.js';
import ForeignRecordings from '../../../../data/recordings/ForeignRecordings.js';
import SpeakerVowels from '../../../../data/vowels/SpeakerVowels.js';

export default class GatheringForeignController extends RenderController {
    async init(prev) {
        this.initStart(prev);

        this.foreignInitial = new SpeakerVowels("EN");

        this.initFinalAndRun(prev);

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

    getRecordingEntry() {
        let vowel = this.foreignInitial.nextVowel();
        this.currentEntry = this.englishRecordings.getRandomEntryForVowel(vowel.letter);
        return this.currentEntry;
    }
}
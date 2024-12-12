import DataLoadedFromFile from "../DataLoadedFromFile.js";
import SpeakerRecordings from "./SpeakerRecordings.js";
import { VOWEL_DATA } from "../../const/VOWEL_INVENTORIES.js";
import VowelRecording from "./VowelRecording.js";
export default class ForeignRecordings extends DataLoadedFromFile {
    speakers = [];
    entriesBySpeaker = {};
    entriesByVowel = {};
    constructor(language = "EN") {
        super();
        this.language = language;
    }
    static async create(language, callback) {
        return await super.create(callback, language);
    }
    async _load() {
        let speakers = await fetch(`./data/recordings/${this.language}/listing.json`);
        this.speakers = speakers = await speakers.json();
        await Promise.all(speakers.map(async (speaker) => {
            const recordings = this.entriesBySpeaker[speaker] =
                await SpeakerRecordings.create(this.language, speaker);
            const vowelSymbols = recordings.vowels.getVowelSymbols();
            recordings.forEach(recording => {
                const textGrid = recording.textGrid;
                const vowelIntervals = textGrid.getVowelIntervals(vowelSymbols);
                vowelIntervals.forEach(interval => {
                    const vowelSymbol = interval.text;
                    this.entriesByVowel[vowelSymbol] ??= [];
                    this.entriesByVowel[vowelSymbol].push(new VowelRecording({ speaker, recording, interval }, this.language));
                });
            });
        }));
        for (let vowelSymbol of VOWEL_DATA[this.language].IPA.broad) {
            if (!this.entriesByVowel[vowelSymbol]?.length) {
                throw new Error(`No recordings for vowel ${vowelSymbol}`);
            }
        }
    }
    getRandomEntryForVowel(vowelSymbol) {
        const entries = this.entriesByVowel[vowelSymbol];
        return entries[Math.floor(Math.random() * entries.length)];
    }
}

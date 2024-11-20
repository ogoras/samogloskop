import DataLoadedFromFile from "../DataLoadedFromFile.js";
import SpeakerRecordings from "./SpeakerRecordings.js";
import { VOWEL_DATA } from "../../const/vowel_inventories/VOWEL_INVENTORIES.js";

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
        let speakers = await fetch(`./recordings/${this.language}/listing.json`);
        this.speakers = speakers = await speakers.json();
        await Promise.all(speakers.map(async speaker => {
            let recordings = this.entriesBySpeaker[speaker] = 
                await SpeakerRecordings.create(this.language, speaker);
            let vowelSymbols = recordings.vowels.getVowelSymbols();
            recordings.forEach(recording => {
                let textGrid = recording.textGrid;
                let vowelIntervals = textGrid.getVowelIntervals(vowelSymbols);
                vowelIntervals.forEach(interval => {
                    let vowelSymbol = interval.text;
                    this.entriesByVowel[vowelSymbol] ??= [];
                    this.entriesByVowel[vowelSymbol].push({speaker, recording, interval});
                });
            })
        }));
        for (let vowelSymbol of VOWEL_DATA[this.language].IPA.broad) {
            if (!this.entriesByVowel[vowelSymbol]?.length) {
                throw new Error(`No recordings for vowel ${vowelSymbol}`);
            }
        }
    }

    getRandomEntryForVowel(vowelSymbol) {
        let entries = this.entriesByVowel[vowelSymbol];
        return entries[Math.floor(Math.random() * entries.length)];
    }
}
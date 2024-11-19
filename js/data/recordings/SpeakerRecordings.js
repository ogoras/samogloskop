import { ArrayLoadedFromFile } from "../DataLoadedFromFile.js";
import SpeakerVowels from "../vowels/SpeakerVowels.js";
import Recording from "./Recording.js";

export default class SpeakerRecordings extends ArrayLoadedFromFile {
    constructor(language, speaker) {
        super();
        this.language = language;
        this.speaker = speaker;
    }

    static async create(language, speaker, callback) {
        return await super.create(callback, language, speaker);
    }

    async _load() {
        let dir = `./recordings/${this.language}/${this.speaker}`;
        let listing = await fetch(`${dir}/listing.json`);
        listing = await listing.json();
        let recording_names = this.recording_names = listing
            .filter(filename => filename.endsWith(".wav") && listing.includes(filename.replace(".wav", ".TextGrid")))
            .map(filename => filename.replace(".wav", ""));
// // for debugging
// recording_names = recording_names.slice(5, 6);
        let info = this.info = await(await fetch(`${dir}/info.json`)).json();
        let recordings = await Promise.all(recording_names.map(
            async recording_name => await Recording.create(`${dir}/${recording_name}`, info.preset)
        ));
        this.push(...recordings);
    }
}
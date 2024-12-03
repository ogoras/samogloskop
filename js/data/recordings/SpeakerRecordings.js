import { ArrayLoadedFromFile } from "../DataLoadedFromFile.js";
import SpeakerVowels from "../vowels/SpeakerVowels.js";
import Recording from "./Recording.js";

export default class SpeakerRecordings extends ArrayLoadedFromFile {
    constructor(language, speaker) {
        super();
        for (const [arg_key, arg] of Object.entries({language, speaker})) {
            if (typeof arg !== "string") {
                throw new Error(`${arg_key} must be a string, got ${arg} of type ${typeof arg} instead.`);
            }
        }
        this.language = language;
        this.speaker = speaker;
        this.vowels = new SpeakerVowels(language);
    }

    static async create(language, speaker, callback) {
        return await super.create(callback, language, speaker);
    }

    async _load() {
        const dir = `./recordings/${this.language}/${this.speaker}`;
        let listing = await fetch(`${dir}/listing.json`);
        listing = await listing.json();
        const recording_names = this.recording_names = listing
            .filter(filename => filename.endsWith(".wav") &&
                listing.includes(filename.replace(".wav", ".TextGrid"))
            )
            .map(filename => filename.replace(".wav", ""));
// // for debugging
// recording_names = recording_names.slice(5, 6);
        const info = this.info = await(await fetch(`${dir}/info.json`)).json();
        const recordings = await Promise.all(recording_names.map(
            async recording_name => await Recording.create(`${dir}/${recording_name}`, info)
        ));
        this.push(...recordings);
        this.vowels.gatherMeasurements(this.flatMap(
            recording => recording.getVowelMeasurements(this.vowels.getVowelSymbols())
        ));
    }
}
import TextGrid from './TextGrid.js';
import soundToFormant from '../../praat/formant.js';
import { PRESETS, PRESET_FREQUENCIES } from '../../const/presets.js';
import DataLoadedFromFile from '../DataLoadedFromFile.js';

// represents an audio recording along with its transcription in the form of a TextGrid
export default class Recording extends DataLoadedFromFile {
    constructor(path, preset) {
        super();
        this.path = path;
        this.preset = preset;
    }

    static async create(path, preset, callback) {
        return await super.create(callback, path, preset);
    }

    async _load() {
        this.textGrid = await TextGrid.create(`${this.path}.TextGrid`);
        let wav = await fetch(`${this.path}.wav`);

        this.sampleRate = 48000;    // TODO: extract from file?
        let audioCtx = new AudioContext({ sampleRate: this.sampleRate });

        let arrayBuffer = await wav.arrayBuffer();
        let decodedData = await audioCtx.decodeAudioData(arrayBuffer);
        this.samples = decodedData.getChannelData(0);
    }

    getVowelMeasurements(vowels) {
        let vowelSegments = this.textGrid.getVowelSegments(vowels);
        return vowelSegments.map(segment => {
            let samples = this.getSamples(segment);
            let formants = soundToFormant(samples, this.sampleRate, PRESET_FREQUENCIES[PRESETS[this.preset]]);
            let values = formants.map(formants => {
                return {
                    x: formants.formant[1].frequency,
                    y: formants.formant[0].frequency
                };
            });
            values.vowel = segment.text;
            values.word = this.textGrid.getWordAt(segment.xmin);
            values.phrase = this.textGrid.getPhraseAt(segment.xmin);
            return values;
        })//.filter(values => values.length >= 3); TODO add more recordings with longer vowels
    }

    getSamples(segment) {
        let firstIndex = segment.xmin * this.sampleRate;
        let lastIndex = segment.xmax * this.sampleRate;
        return this.samples.slice(firstIndex, lastIndex);
    }
}
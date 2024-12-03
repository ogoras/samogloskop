import TextGrid from './TextGrid.js';
import soundToFormant from '../../logic/praat/formant.js';
import Preset from '../../const/presets.js';
import DataLoadedFromFile from '../DataLoadedFromFile.js';

// represents an audio recording along with its transcription in the form of a TextGrid
export default class Recording extends DataLoadedFromFile {
    constructor(path, info) {
        super();
        this.path = path;
        this.speakerInfo = info;
        this.preset = Preset.get(info.preset);
    }

    static async create(path, info, callback) {
        return await super.create(callback, path, info);
    }

    async _load() {
        this.textGrid = await TextGrid.create(`${this.path}.TextGrid`);
        const wav = await fetch(`${this.path}.wav`);

        this.sampleRate = 48000;    // TODO: extract from file?
        const audioCtx = new AudioContext({ sampleRate: this.sampleRate });

        const arrayBuffer = await wav.arrayBuffer();
        const decodedData = await audioCtx.decodeAudioData(arrayBuffer);
        this.samples = decodedData.getChannelData(0);
    }

    getVowelMeasurements(vowelSymbols) {
        let vowelSegments = this.textGrid.getVowelIntervals(vowelSymbols);
        return vowelSegments.map(segment => {
            const samples = this.getSamples(segment);
            const formants = soundToFormant(samples, this.sampleRate, this.preset.frequency);
            let values = formants.map(formants => {
                return {
                    x: formants.formant[1].frequency,
                    y: formants.formant[0].frequency
                };
            });
            values.vowel = segment.text;
            values.word = this.textGrid.getWordIntervalAt(segment.xmin)?.text;
            values.phrase = this.textGrid.getPhraseIntervalAt(segment.xmin)?.text;
            return values;
        })//.filter(values => values.length >= 3); TODO add more recordings with longer vowels
    }

    getSamples({xmin, xmax}, paddingDuration = 0) {
        const firstIndex = xmin * this.sampleRate;
        const lastIndex = xmax * this.sampleRate;
        const samples = this.samples.slice(firstIndex, lastIndex);
        if (!paddingDuration) return samples;
        const paddingNumber = Math.floor(paddingDuration * this.sampleRate);
        const padding = new Float32Array(paddingNumber);
        return new Float32Array([...padding, ...samples, ...padding]);
    }
}
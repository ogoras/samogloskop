import TextGrid from './TextGrid.js';
import soundToFormant from '../praat/formant.js';

export default class Recording {
    constructor(path) {
        this.path = path;
    }

    async load() {
        this.textGrid = new TextGrid(`${this.path}.TextGrid`);
        await this.textGrid.load();
        let wav = await fetch(`${this.path}.wav`);
        this.sampleRate = 48000;
        let audioCtx = new AudioContext({ sampleRate: this.sampleRate });
        let decodedData = await audioCtx.decodeAudioData(await wav.arrayBuffer());
        this.samples = decodedData.getChannelData(0);
    }

    getVowelMeasurements(vowels) {
        let vowelSegments = this.textGrid.getVowelSegments(vowels);
        return vowelSegments.map(segment => {
            let samples = this.getSamples(segment);
            let formants = soundToFormant(samples, this.sampleRate);
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
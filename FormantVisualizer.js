import { drawFormants } from './drawFormants.js';
import { soundToFormant } from './sound_to_formant/formant.js';

export class FormantVisualizer {
    constructor(sampleRate) {
        this.sampleRate = sampleRate;
    }

    feed(samples) {
        const formants = soundToFormant([...samples], this.sampleRate);
        for (let i = 0; i < formants.length; i++) {
            if (formants[i].formant.length >= 2) {
                drawFormants(formants[i].formant[0].frequency, formants[i].formant[1].frequency);
            }
        }
    }
}
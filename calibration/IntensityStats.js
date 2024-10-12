import { Buffer } from '../util/Buffer.js';

export class IntensityStats {
    min = Infinity;
    max = -Infinity;
    mean = 0;
    time = 0;
    stepsElapsed = 0;
    zeroReached = false;

    get range() {
        return 10 * Math.log10(this.max / this.min);
    }

    constructor(timeRequired, statsStep) {
        this.timeRequired = timeRequired;
        this.statsStep = statsStep;
        this.buffer = new Buffer(Math.ceil(2 * timeRequired / statsStep));
    }

    update(time, formants, samples) {
        if (time < this.time + this.statsStep) return false;
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (let formant of formants) {
            min = Math.min(min, formant.intensity);
            max = Math.max(max, formant.intensity);
            sum += formant.intensity;
        }
        let mean = sum / formants.length;
        if (min === Infinity) {
            // calculate based on samples
            let zeroReached = false;
            min = samples.reduce((acc, val) => {
                if (val) return Math.min(acc, val * val)
                else {
                    zeroReached = true;
                    return acc;
                }
            }, Infinity);
            if (min === Infinity && zeroReached) {
                min = 0;
                max = 0;
                mean = 0;
            }
            else {
                max = samples.reduce((acc, val) => Math.max(acc, val * val), -Infinity);
                mean = samples.reduce((acc, val) => acc + val * val, 0) / this.samplesBuffer.length;
            }
        }
        this.buffer.push({
            min, max, mean
        });
        // update global stats
        this.stepsElapsed++;
        this.time = this.stepsElapsed * this.statsStep;
        this.min = Infinity;
        this.max = -Infinity;
        sum = 0;
        let count = 0;
        this.zeroReached = false;
        for (let stats of this.buffer.buffer) {
            if (stats.min === Infinity) continue;
            if (stats.min) this.min = Math.min(this.min, stats.min)
            else this.zeroReached = true;
            this.max = Math.max(this.max, stats.max);
            sum += stats.mean;
            count++;
        }
        this.mean = sum / count;
        return true;
    }
}
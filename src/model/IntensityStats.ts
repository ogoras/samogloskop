import Buffer from '../logic/util/Buffer.js';

type statsType = {
    min: number;
    max: number;
    mean: number;
    range: number;
    zeroReached: boolean;
}

type minMaxMean = {
    min: number;
    max: number;
    mean: number;
}

export default class IntensityStats {
    min = Infinity;
    max = -Infinity;
    mean = 0;
    startTime = 0;
    time = 0;
    startStep = 0;
    step = 0;
    zeroReached = false;
    silenceStats?: statsType;
    speechStats?: statsType;
    [index: string]: any;
    buffer: Buffer<minMaxMean>;

    get range() {
        return 10 * Math.log10(this.max / this.min);
    }

    get SNR() {
        if (!this.silenceStats) return undefined;
        return 10 * Math.log10(this.max / this.silenceStats.max);
    }

    get timeElapsed() {
        return this.time - this.startTime;
    }

    get stepsElapsed() {
        return this.step - this.startStep;
    }

    get silenceDuration() {
        return this.buffer.getLastElements(this.stepsElapsed)
            .reduce((acc: number, val: minMaxMean) => this.isSilence(val) ? acc + this.stepDuration : 0, 0);
    }

    get isCalibrated() {
        return this.silenceStats !== undefined && this.speechStats !== undefined;
    }

    constructor(timeRequired: number, stepDuration: number) {
        this.timeRequired = timeRequired;
        this.stepDuration = stepDuration;
        this.buffer = new Buffer(Math.ceil(2 * timeRequired / stepDuration));
    }

    update(time: number, intensitiesBasedOnFormants: number[], samples: number[]) {
        if (time < this.time + this.stepDuration) return false;
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        for (let intensity of intensitiesBasedOnFormants) {
            min = Math.min(min, intensity);
            max = Math.max(max, intensity);
            sum += intensity;
        }
        let mean = sum / intensitiesBasedOnFormants.length;
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
                mean = samples.reduce((acc, val) => acc + val * val, 0) / samples.length;
            }
        }
        this.buffer.push({
            min, max, mean
        });
        // update global stats
        this.step++;
        this.time = this.step * this.stepDuration;
        this.min = Infinity;
        this.max = -Infinity;
        sum = 0;
        let count = 0;
        this.zeroReached = false;
        for (let stats of this.buffer.getLastElements(this.stepsElapsed)) {
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

    saveStats(name: string) {
        this[`${name}Stats`] = {
            min: this.min,
            max: this.max,
            mean: this.mean,
            range: this.range,
            zeroReached: this.zeroReached
        };
    }

    detectSpeech() {
        if (this.speechStats !== undefined) {
            return !this.isSilence();
        }
        const val = this.max > this.silenceStats!.max;
        if (val) {
            this.resetStart();
        }
        return val;
    }

    resetStart() {
        this.startTime = this.time;
        this.startStep = this.step;
    }

    isCalibrationFinished(time: number) {
        return time - this.startTime >= this.timeRequired;
    }
    
    diff(index: number) {
        if (!this.silenceStats) return undefined;
        switch(index) {
            case 0:
                return 10 * Math.log10(this.min / this.silenceStats.min);
            case 1:
                return 10 * Math.log10(this.max / this.silenceStats.max);
            case 2:
                return 10 * Math.log10(this.mean / this.silenceStats.mean);
            default:
                return this.SNR;
        }
    }

    isSilence(stats = this.buffer.getLastElement()) {
        if (!stats || !this.speechStats) return false;
        return stats.mean < adjustdB(this.speechStats.max, -30);
    }

    compact() {
        return {
            speechStats: this.speechStats,
            silenceStats: this.silenceStats,
            timeRequired: this.timeRequired,
            stepDuration: this.stepDuration
        };
    }

    toString() {
        return JSON.stringify(this.compact());
    }

    static fromString(string: string) {
        const object = JSON.parse(string);
        const stats = new IntensityStats(object.timeRequired, object.stepDuration);
        stats.speechStats = object.speechStats;
        stats.silenceStats = object.silenceStats;
        return stats;
    }
}

function adjustdB(value: number, dB: number) {
    return value * Math.pow(10, dB / 10);
}
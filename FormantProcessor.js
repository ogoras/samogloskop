import { soundToFormant } from './sound_to_formant/formant.js';
import { IntensityStats } from './calibration/data/IntensityStats.js';
import { Buffer } from './util/Buffer.js';
import { UserVowels } from './calibration/data/UserVowels.js';
import { STATES, STATE_NAMES } from './definitions/states.js';
import { PRESETS, PRESET_NAMES } from './definitions/presets.js';

let vowels = {
    a : { F1: 800, F2: 1300, color: "rgb(255, 0, 0)" },
    e : { F1: 660, F2: 1600, color: "rgb(250, 165, 0)" },
    i : { F1: 300, F2: 2300, color: "rgb(0, 200, 0)" },
    o : { F1: 580, F2: 900, color: "rgb(255, 0, 255)" },
    u : { F1: 320, F2: 630, color: "rgb(0, 0, 255)"  },
    y : { F1: 480, F2: 1750, color: "rgb(150, 75, 0)" }
}

const formantCount = 20;
const statsStep = 0.1;    // 100 ms
const calibrationTime = 10; // 10 s

export class FormantProcessor {
    get calibrationTime() {
        return calibrationTime;
    }
    formantsBuffer = new Buffer(formantCount);
    time = 0;
    div = document.getElementById("formants");
    intensityStats = new IntensityStats(calibrationTime, statsStep);
    userVowels = new UserVowels();
    //scatterPlot = new ScatterPlot("formants", true, "Hz");

    constructor(sampleRate, state = STATES.NO_SAMPLES_YET, preset) {
        this.sampleRate = sampleRate;
        this.samplesBuffer = new Buffer(this.sampleRate / 20);
        this.state = state;
        this.preset = preset;
        //this.scatterPlot.addSeries(Object.entries(vowels).map(this.vowelToScatterPlotEntry.bind(this)));
        //this.scatterPlot.addSeries([], true, formantCount);
        //this.scatterPlot.addSeries([]);
    }

    vowelToScatterPlotEntry(vowel) {
        let [key, value] = vowel;
        return {
            label: key,
            x : value.F2,
            y : value.F1,
            color: value.color
        };
    }

    feed(samples) {
        let ret = {};

        if (this.state === STATES.NO_SAMPLES_YET) {
            ret.newState = this.state = STATES.GATHERING_SILENCE;
        }
        this.samplesBuffer.pushMultiple(samples);
        const formants = soundToFormant(this.samplesBuffer.getCopy(), this.sampleRate);
        for (let formant of formants) {
            this.formantsBuffer.push({
                F1: formant.formant.length >= 1 ? formant.formant[0].frequency : null,
                F2: formant.formant.length >= 2 ? formant.formant[1].frequency : null,
                endTime: this.time,
                length: this.samplesBuffer.length,
                intensity: formant.intensity
            });
        }
        this.time += samples.length / this.sampleRate;
        switch (this.state) {
            case STATES.GATHERING_SILENCE:
                ret.progressTime = this.time;
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    ret.intensityStats = this.intensityStats;
                    this.formantsBuffer.clear();
                }
                if (this.intensityStats.isCalibrationFinished(this.time)) {
                    ret.newState = this.state = STATES.WAITING_FOR_SPEECH;
                    this.intensityStats.saveStats("silence");
                }
                return ret;
            case STATES.WAITING_FOR_SPEECH:
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer) 
                    && this.intensityStats.detectSpeech()) {
                    ret.newState = this.state = STATES.MEASURING_SPEECH;
                    ret.startTime = this.time;
                }
                return ret;
            case STATES.MEASURING_SPEECH:
                ret.progressTime = this.time;
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    ret.intensityStats = this.intensityStats;
                    this.formantsBuffer.clear();
                }
                if (this.intensityStats.isCalibrationFinished(this.time)) {
                    ret.newState = this.state = STATES.SPEECH_MEASURED;
                    this.intensityStats.saveStats("speech");
                    this.intensityStats.resetStart();
                }
                return ret;
            case STATES.SPEECH_MEASURED:
                // wait for 2 seconds of silence
                const silenceRequired = 2;
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    let length = this.intensityStats.silenceDuration;
                    ret.progress = length / silenceRequired;
                    if (this.intensityStats.silenceDuration >= silenceRequired) {
                        ret.progress = 1;
                        ret.newState = this.state = STATES.WAITING_FOR_VOWELS;
                    }
                }
                return ret;
            case STATES.WAITING_FOR_VOWELS:
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    if (this.intensityStats.detectSpeech()) {
                        ret.newState = this.state = STATES.GATHERING_VOWELS;
                    }
                }
                return ret;
            case STATES.GATHERING_VOWELS:
                this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer);
                if (!this.intensityStats.detectSpeech()) {
                    this.formantsBuffer.clear();
                    return ret;
                }
                ret.formants = this.formantsBuffer.buffer;
                this.formantsBuffer.clear();
                return ret;
            case STATES.DONE:
                feedPlot(formants);
                return ret;
            default:
                throw new Error("Unknown state: " + this.state);
        }
    }

    feedPlot(formants) {
        for (let i = 0; i < formants.length; i++) {
            if (formants[i].formant.length >= 2) {
                let formantsEntry = {
                    x: formants[i].formant[1].frequency,
                    y: formants[i].formant[0].frequency,
                    color: "#00000044"
                }
                this.formantsBuffer.push(formantsEntry);
                this.scatterPlot.feed(formantsEntry, -2);
            }
        }
        if (formants.length > 0) this.updateScatterPlot();
    }

    updateScatterPlot() {
        const ratio = 0.5;
        let weightSum = 0;
        let xSum = 0;
        let ySum = 0;
        let weight = 1;
        for (let formants of this.formantsBuffer.buffer) {
            xSum += formants.x * weight;
            ySum += formants.y * weight;
            weightSum += weight;
            weight *= ratio;
        }
        this.scatterPlot.setSeriesSingle({
            x: xSum / weightSum,
            y: ySum / weightSum,
            size: 10
        }, -1, 50);
    }

    reset() {
        this.samplesBuffer.clear();
        this.formantsBuffer.clear();
        if (this.state === STATES.DONE) {
            this.scatterPlot.clearSeries(-1);
            this.scatterPlot.clearSeries(-2);
        }
    }

    recordingStarted() {
        this.reset();
    }

    recordingStopped() {
    }
}
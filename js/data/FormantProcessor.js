import soundToFormant from '../praat/formant.js';
import IntensityStats from './IntensityStats.js';
import Buffer from '../util/Buffer.js';
import SpeakerVowels from './SpeakerVowels.js';
import { STATES, STATE_NAMES } from '../const/states.js';
import { PRESETS, PRESET_NAMES, PRESET_FREQUENCIES } from '../const/presets.js';
import { POINT_SIZES } from '../const/POINT_SIZES.js';

export const formantCount = 20;
const minimumSmoothingCount = 20;
const statsStep = 0.1;    // 100 ms
const calibrationTime = 10; // 10 s

export default class FormantProcessor {
    get calibrationTime() { return calibrationTime; }
    formantsBuffer = new Buffer(formantCount);
    time = 0;
    div = document.getElementById("formants");
    intensityStats = new IntensityStats(calibrationTime, statsStep);
    userVowels = new SpeakerVowels();

    constructor(sampleRate, state = STATES.NO_SAMPLES_YET, preset = PRESETS.FEMALE) {
        this.sampleRate = sampleRate;
        this.samplesBuffer = new Buffer(this.sampleRate / 20);
        this.state = state;
        this.preset = preset;
        if (state >= STATES.SPEECH_MEASURED) {
            this.intensityStats = IntensityStats.fromString(localStorage.getItem("intensityStats"));
        }
        if (state >= STATES.CONFIRM_VOWELS) {
            this.userVowels = SpeakerVowels.fromString(localStorage.getItem("userVowels"));
        }
    }

    changePreset(preset) {
        this.preset = preset;
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
        const formants = soundToFormant(this.samplesBuffer.getCopy(), this.sampleRate, PRESET_FREQUENCIES[this.preset]);
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
                    ret.intensityStatsString = this.intensityStats.toString();
                    this.intensityStats.resetStart();
                }
                return ret;
            case STATES.SPEECH_MEASURED:
                // wait for 2 seconds of silence
                var silenceRequired = 2;
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    let length = this.intensityStats.silenceDuration;
                    ret.progress = length / silenceRequired;
                    if (this.intensityStats.silenceDuration >= silenceRequired) {
                        ret.progress = 1;
                        ret.newState = this.state = STATES.WAITING_FOR_VOWELS;
                        this.smoothedFormantsBuffer = new Buffer(minimumSmoothingCount);
                    }
                }
                return ret;
            case STATES.WAITING_FOR_VOWELS:
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    if (this.intensityStats.detectSpeech()) {
                        ret.newState = this.state = STATES.GATHERING_VOWELS;
                        this.formantsBuffer.clear();
                        this.smoothedFormantsBuffer ??= new Buffer(minimumSmoothingCount);
                        this.smoothedFormantsBuffer.clear();
                    }
                }
                return ret;
            case STATES.GATHERING_VOWELS:
            case STATES.CONFIRM_VOWELS:
            case STATES.TRAINING:
                this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer);
                this.smoothedFormantsBuffer ??= new Buffer(minimumSmoothingCount);
                if (!this.intensityStats.detectSpeech()) {
                    this.formantsBuffer.clear();
                    this.smoothedFormantsBuffer.clear();
                    if (this.state === STATES.GATHERING_VOWELS) ret.newState = this.state = STATES.WAITING_FOR_VOWELS;
                    return ret;
                }
                ret.formants = [];
                for (let formant of formants) {
                    if (formant.formant.length >= 2) {
                        let point = {
                            x: formant.formant[1].frequency,
                            y: formant.formant[0].frequency,
                            // color: "#00000044",
                            // size: POINT_SIZES.TRAIL
                        }
                        this.userVowels.scale(point);
                        ret.formants.push(point);
                    }
                }
                ret.formantsSmoothed = this.userVowels.scale(this.smoothedFormants);
                if (this.state === STATES.GATHERING_VOWELS) {
                    ret.formantsSaved = this.formantsToSave;
                    this.userVowels.addFormants(this.formantsToSave);
                    this.formantsToSave = undefined;
                    if (this.userVowels.isVowelGathered()) {
                        ret.vowel = this.userVowels.saveVowel();
                        if (this.userVowels.isDone()) {
                            ret.newState = this.state = STATES.CONFIRM_VOWELS;
                            this.userVowels.scaleLobanov();
                            ret.userVowelsString = this.userVowels.toString();
                        } else {
                            ret.newState = this.state = STATES.VOWEL_GATHERED;
                        }
                    }
                }
                return ret;
            case STATES.VOWEL_GATHERED:
                // wait for 1 second of silence
                var silenceRequired = 1;
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    let length = this.intensityStats.silenceDuration;
                    ret.progress = length / silenceRequired;
                    if (this.intensityStats.silenceDuration >= silenceRequired) {
                        ret.progress = 1;
                        ret.newState = this.state = STATES.WAITING_FOR_VOWELS;
                        this.smoothedFormantsBuffer.clear();
                    }
                }
                return ret;
            default:
                throw new Error("Unknown state: " + STATE_NAMES[this.state] ?? this.state);
        }
    }

    get smoothedFormants() {
        if (this.formantsBuffer.length < minimumSmoothingCount) return undefined;
        const ratio = 0.5;
        let weightSum = 0;
        let xSum = 0;
        let ySum = 0;
        let weight = 1;
        for (let formants of this.formantsBuffer.buffer) {
            xSum += formants.F2 * weight;
            ySum += formants.F1 * weight;
            weightSum += weight;
            weight *= ratio;
        }
        let smoothedFormants = {
            x: xSum / weightSum,
            y: ySum / weightSum,
            size: POINT_SIZES.CURRENT,
            //color: !this.userVowels.isDone() ? this.userVowels.currentVowel.rgb : "black"
        };
        this.formantsToSave = this.smoothedFormantsBuffer.push(smoothedFormants)
        if (this.formantsToSave) this.formantsToSave.size = POINT_SIZES.USER_DATAPOINTS;
        return smoothedFormants;
    }

    recordingStarted() {
        this.samplesBuffer.clear();
        this.formantsBuffer.clear();
    }

    recordingStopped() {}
}
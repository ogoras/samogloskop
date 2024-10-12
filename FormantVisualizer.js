import { soundToFormant } from './sound_to_formant/formant.js';
import { SilenceView } from './calibration/view/SilenceView.js';
import { MeasuringSpeechView } from './calibration/view/MeasuringSpeechView.js';
import { IntensityStats } from './calibration/data/IntensityStats.js';
import { Buffer } from './util/Buffer.js';
import { GatheringVowelsView } from './calibration/view/GatheringVowelsView.js';
import { UserVowels } from './calibration/data/UserVowels.js';

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
const STATES = {
    NO_SAMPLES_YET: 0,
    GATHERING_SILENCE: 1,
    WAITING_FOR_SPEECH: 2,
    MEASURING_SPEECH: 3,
    SPEECH_MEASURED: 4,
    WAITING_FOR_VOWELS: 5,
    GATHERING_VOWELS: 6,
    DONE: 7
}
export class FormantVisualizer {
    formantsBuffer = new Buffer(formantCount);
    state = STATES.NO_SAMPLES_YET;
    time = 0;
    div = document.getElementById("formants");
    intensityStats = new IntensityStats(calibrationTime, statsStep);
    userVowels = new UserVowels();
    //scatterPlot = new ScatterPlot("formants", true, "Hz");

    constructor(sampleRate) {
        this.sampleRate = sampleRate;
        this.samplesBuffer = new Buffer(this.sampleRate / 20);
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
        if (this.state === STATES.NO_SAMPLES_YET) {
            this.state = STATES.GATHERING_SILENCE;
            this.view = new SilenceView(this.div, calibrationTime);
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
                this.view.updateProgress(this.time);
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    this.view.update(this.intensityStats);
                    this.formantsBuffer.clear();
                }
                if (this.intensityStats.isCalibrationFinished(this.time)) {
                    this.state = STATES.WAITING_FOR_SPEECH;
                    this.intensityStats.saveStats("silence");
                    this.view = new MeasuringSpeechView(this.view);
                }
                return;
            case STATES.WAITING_FOR_SPEECH:
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer) 
                    && this.intensityStats.detectSpeech()) {
                    this.state = STATES.MEASURING_SPEECH;
                    this.view.speechDetected = true;
                    this.view.startTime = this.time;
                }
                return;
            case STATES.MEASURING_SPEECH:
                this.view.updateProgress(this.time);
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    this.view.update(this.intensityStats);
                    this.formantsBuffer.clear();
                }
                if (this.intensityStats.isCalibrationFinished(this.time)) {
                    this.state = STATES.SPEECH_MEASURED;
                    this.intensityStats.saveStats("speech");
                    this.intensityStats.resetStart();
                    this.view.finish();
                }
                return;
            case STATES.SPEECH_MEASURED:
                // wait for 2 seconds of silence
                const silenceRequired = 2;
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    let length = this.intensityStats.silenceDuration;
                    this.view.updateProgress(length / silenceRequired, false);
                    if (this.intensityStats.silenceDuration >= silenceRequired) {
                        this.view.updateProgress(1, false);
                        this.state = STATES.WAITING_FOR_VOWELS;
                        this.view = new GatheringVowelsView(this.view, this.userVowels);
                    }
                }
                return;
            case STATES.WAITING_FOR_VOWELS:
                if (this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) {
                    if (this.intensityStats.detectSpeech()) {
                        this.state = STATES.GATHERING_VOWELS;
                        this.view.speechDetected = true;
                    }
                }
                return;
            case STATES.GATHERING_VOWELS:
                this.view.feed(this.formantsBuffer.buffer);
                this.formantsBuffer.clear();
                return;
            case STATES.DONE:
                feedPlot(formants);
                return;
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
        if (this.view) this.view.recordingStarted();
    }

    recordingStopped() {
        if (this.view) this.view.recordingStopped();
    }
}
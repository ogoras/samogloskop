import { soundToFormant } from './sound_to_formant/formant.js';
import { SilenceView } from './calibration/SilenceView.js';
import { IntensityStats } from './calibration/IntensityStats.js';
import { ScatterPlot } from './visualization/ScatterPlot.js';
import { Buffer } from './util/Buffer.js';

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
const silenceRequired = 10; // 10 s
const STATES = {
    NO_SAMPLES_YET: 0,
    GATHERING_SILENCE: 1,
    WAITING_FOR_SPEECH: 2,
    MEASURING_SPEECH: 3,
    GATHERING_VOWELS: 4,
    DONE: 5
}
export class FormantVisualizer {
    formantsBuffer = new Buffer(formantCount);
    state = STATES.NO_SAMPLES_YET;
    time = 0;
    div = document.getElementById("formants");
    intensityStats = new IntensityStats(silenceRequired, statsStep);
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
            this.view = new SilenceView(this.div, silenceRequired);
        }
        this.samplesBuffer.pushMultiple(samples);
        const formants = soundToFormant(this.samplesBuffer.getCopy(), this.sampleRate);
        this.time += samples.length / this.sampleRate;
        switch (this.state) {
            case STATES.GATHERING_SILENCE:
                this.view.updateProgress(this.time);
                if (this.time >= silenceRequired) {
                    this.state = STATES.WAITING_FOR_SPEECH;
                }
                for (let formant of formants) {
                    this.formantsBuffer.push({
                        endTime: this.time,
                        length: this.samplesBuffer.length,
                        intensity: formant.intensity
                    });
                }
                if (!this.intensityStats.update(this.time, this.formantsBuffer.buffer, this.samplesBuffer.buffer)) return;
                this.view.update(this.intensityStats);
                this.formantsBuffer.clear();
                return;
            case STATES.WAITING_FOR_SPEECH:
                // TODO
                return;
            case STATES.MEASURING_SPEECH:
                // TODO
                return;
            case STATES.GATHERING_VOWELS:
                // TODO
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
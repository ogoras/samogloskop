import { soundToFormant } from './sound_to_formant/formant.js';
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
    MEASURING_SPEECH: 2,
    GATHERING_VOWELS: 3,
    DONE: 4
}
export class FormantVisualizer {
    formantsBuffer = new Buffer(formantCount);
    state = STATES.NO_SAMPLES_YET;
    time = 0;
    div = document.getElementById("formants");
    silenceStats = {
        time: {
            text: "Nagrano: ",
            unit: "s",
            stepsElapsed: 0,
            roundFunction: (x) => x.toFixed(1),
        },
        min: {
            text: "Minimum: ",
            roundFunction: (x) => x ? x.toExponential(2) : "0",
            color: "rgb(80, 0, 80)"
        },
        max: {
            text: "Maksimum: ",
            roundFunction: (x) => x.toExponential(2),
            color: "rgb(128, 0, 0)"
        },
        mean: {
            text: "Średnia: ",
            roundFunction: (x) => x.toExponential(2),
            color: "rgb(104, 0, 40)"
        },
        range: {
            text: "Rozpiętość: ",
            unit: "dB",
            roundFunction: (x) => x.toFixed(2),
            color: "rgb(0, 0, 180)"
        }
    }
    silenceStatsBuffer = new Buffer(Math.ceil(20 / statsStep)) // each element gathers stats for statsStep seconds
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
            let divStack = this.div.querySelector(".center").querySelector(".stack");
            this.h2 = divStack.querySelector("h2");
            this.recordingStarted();
            // remove the p element
            divStack.querySelector("p").remove();
            let progressBar = document.createElement("div");
            progressBar.classList.add("progress-bar");
            divStack.appendChild(progressBar);
            let progress = document.createElement("div");
            progress.classList.add("progress");
            progressBar.appendChild(progress);
            this.progress = progress;
            // add multiple div.center elements to the stack
            for (let key in this.silenceStats) {
                let object = this.silenceStats[key];
                let element = object.element = document.createElement("div");
                element.classList.add("center");
                divStack.appendChild(element);
                let h3 = document.createElement("h3");
                h3.innerHTML = object.text;
                element.appendChild(h3);
                element.appendChild(document.createElement("hr"));
                let span = document.createElement("span");
                if (object.color) span.style.color = object.color
                element.appendChild(span);
                object.span = span;
                if (object.unit) {
                    element.appendChild(document.createElement("hr"));
                    let unit = document.createElement("span");
                    if (object.color) unit.style.color = object.color
                    unit.innerHTML = object.unit;
                    element.appendChild(unit);
                }
            }
        }
        this.samplesBuffer.pushMultiple(samples);
        const formants = soundToFormant(this.samplesBuffer.getCopy(), this.sampleRate);
        this.time += samples.length / this.sampleRate;
        switch (this.state) {
            case STATES.GATHERING_SILENCE:
                this.progress.style.width = 100 * this.time / silenceRequired + "%";
                if (this.time >= silenceRequired) {
                    this.progress.style.width = "100%"; // just in case
                    this.state = STATES.MEASURING_SPEECH;
                }
                for (let formant of formants) {
                    this.formantsBuffer.push({
                        endTime: this.time,
                        length: this.samplesBuffer.length,
                        intensity: formant.intensity
                    });
                }
                if (this.time < this.silenceStats.time.value + statsStep) return;
                let min = Infinity;
                let max = -Infinity;
                let sum = 0;
                for (let formant of this.formantsBuffer.buffer) {
                    min = Math.min(min, formant.intensity);
                    max = Math.max(max, formant.intensity);
                    sum += formant.intensity;
                }
                let mean = sum / this.formantsBuffer.length;
                if (min === Infinity) {
                    // calculate based on samples
                    let zeroReached = false;
                    min = this.samplesBuffer.buffer.reduce((acc, val) => {
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
                        max = this.samplesBuffer.buffer.reduce((acc, val) => Math.max(acc, val * val), -Infinity);
                        mean = this.samplesBuffer.buffer.reduce((acc, val) => acc + val * val, 0) / this.samplesBuffer.length;
                    }
                }
                this.silenceStatsBuffer.push({
                    min, max, mean
                });
                this.updateSilenceStats();
                this.formantsBuffer.clear();
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

    updateSilenceStats() {
        this.silenceStats.time.stepsElapsed++;
        this.silenceStats.time.value = this.silenceStats.time.stepsElapsed * statsStep;
        let min = Infinity;
        let max = -Infinity;
        let sum = 0;
        let count = 0;
        let zeroReached = false;
        for (let stats of this.silenceStatsBuffer.buffer) {
            if (stats.min === Infinity) continue;
            if (stats.min) min = Math.min(min, stats.min)
            else zeroReached = true;
            max = Math.max(max, stats.max);
            sum += stats.mean;
            count++;
        }
        this.silenceStats.min.value = zeroReached ? 0 : min;
        this.silenceStats.max.value = max;
        this.silenceStats.mean.value = sum / count;
        this.silenceStats.range.value = 10 * Math.log10(max / min);
        for (let key in this.silenceStats) {
            let object = this.silenceStats[key];
            object.span.innerHTML = object.roundFunction(object.value);
        }
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
        if (this.state === STATES.GATHERING_SILENCE && this.h2) this.h2.innerHTML = "Nagrywanie ciszy, nie odzywaj się...";
    }

    recordingStopped() {
        if (this.state === STATES.GATHERING_SILENCE && this.h2) this.h2.innerHTML = "Nagrywanie ciszy wstrzymane.";
    }
}
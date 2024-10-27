import SpeechView from "../SpeechView.js";

export default class StatsView extends SpeechView {
    constructor() {
        super();
        if (this.constructor === StatsView)
            throw new Error("Cannot instantiate abstract class StatsView");
    }

    startTime = 0;

    silenceStats = {
        time: {
            text: "Nagrano: ",
            unit: "s",
            stepsElapsed: 0,
            value: 0,
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
        }
    }

    updateProgress(value, isTime = true) {
        if (isTime) {
            if (this.startTime === undefined) throw new Error("startTime is not set");
            let timeElapsed = value - this.startTime;
            this.progressBar.progress = timeElapsed >= this.timeRequired 
                ? 100 
                : timeElapsed / this.timeRequired * 100;
        }
        else {
            this.progressBar.progress = value * 100;
        }
    }

    update(intensityStats) {
        this.silenceStats.time.value = intensityStats.isCalibrated ? this.timeRequired : intensityStats.timeElapsed;
        this.silenceStats.min.value = intensityStats.zeroReached ? 0 : intensityStats.min;
        if (this.silenceStats.min.diff !== undefined) this.silenceStats.min.diff = intensityStats.diff(0);
        this.silenceStats.max.value = intensityStats.max;
        if (this.silenceStats.max.diff !== undefined) this.silenceStats.max.diff = intensityStats.diff(1);
        this.silenceStats.mean.value = intensityStats.mean;
        if (this.silenceStats.mean.diff !== undefined) this.silenceStats.mean.diff = intensityStats.diff(2);
        if (this.silenceStats.range !== undefined) this.silenceStats.range.value = intensityStats.range;
        for (let key in this.silenceStats) {
            let object = this.silenceStats[key];
            object.span.innerHTML = object.roundFunction(object.value);
            if (object.diff !== undefined)  {
                object.diffElement.innerHTML = `(${object.diff > 0 ? "+" : ""}${object.diff.toFixed(2)} dB)`;
            }
        }
    }

    addStatsElements() {
        // add multiple div.center elements to the stack
        for (let key in this.silenceStats) {
            let object = this.silenceStats[key];
            let element = object.element = document.createElement("div");
            element.classList.add("center");
            this.divStack.appendChild(element);
            let h3 = document.createElement("h3");
            h3.innerHTML = object.text;
            element.appendChild(h3);
            element.appendChild(document.createElement("hr"));
            let span = document.createElement("span");
            if (object.color) span.style.color = object.color
            element.appendChild(span);
            object.span = span;
            if (object.diff !== undefined) {
                element.appendChild(document.createElement("hr"));
                let diff = document.createElement("span");
                if (object.color) diff.style.color = object.color
                diff.innerHTML = "( dB)";
                element.appendChild(diff);
                object.diffElement = diff;
            }
            if (object.unit) {
                element.appendChild(document.createElement("hr"));
                let unit = document.createElement("span");
                if (object.color) unit.style.color = object.color
                unit.innerHTML = object.unit;
                element.appendChild(unit);
            }
        }
    }
}
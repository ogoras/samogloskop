import StackComponent from "./StackComponent.js";
import ProgressBar from "../../visualization/progress_bar/ProgressBar.js";

export default class StatsStackComponent extends StackComponent {
    element = undefined;
    startTime = 0;

    stats = {
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

    /**
     * @param {IntensityStats} statsGiven
     */
    set intensityStats(statsGiven) {
        const stats = this.stats;
        stats.time.value = statsGiven.isCalibrated ? this.timeRequired : statsGiven.timeElapsed;
        stats.min.value = statsGiven.zeroReached ? 0 : statsGiven.min;
        if (stats.min.diff !== undefined) stats.min.diff = statsGiven.diff(0);
        stats.max.value = statsGiven.max;
        if (stats.max.diff !== undefined) stats.max.diff = statsGiven.diff(1);
        stats.mean.value = statsGiven.mean;
        if (stats.mean.diff !== undefined) stats.mean.diff = statsGiven.diff(2);
        if (stats.range !== undefined) stats.range.value = statsGiven.range;
        for (let key in stats) {
            const object = stats[key];
            object.span.innerHTML = object.roundFunction(object.value);
            if (object.diff !== undefined)  {
                object.diffElement.innerHTML = `(${object.diff > 0 ? "+" : ""}${object.diff.toFixed(2)} dB)`;
            }
        }
    }

    constructor(prev, timeRequired) {
        super(null);
        if (this.constructor === StatsStackComponent) {
            throw new Error(`Cannot instantiate abstract class ${this.constructor.name}`);
        }

        this.element = prev.element;
        this.h2 = prev.h2;
        this.parent = prev.parent;
        this.hidden = prev.hidden;
        prev.p?.remove?.();
        
        this.timeRequired = timeRequired;
        this.progressBar = new ProgressBar(this)
    }

    updateProgress(value, isTime = true) {
        if (isTime) {
            if (this.startTime === undefined) throw new Error("startTime is not set");
            const timeElapsed = value - this.startTime;
            this.progressBar.progress = timeElapsed >= this.timeRequired 
                ? 100 
                : timeElapsed / this.timeRequired * 100;
        }
        else this.progressBar.progress = value * 100;
    }

    addStatsElements() {
        // add multiple div.center elements to the stack
        for (let key in this.stats) {
            const object = this.stats[key];
            const element = object.element = document.createElement("div");
            element.classList.add("center");
            this.element.appendChild(element);
            const h3 = document.createElement("h3");
            h3.innerHTML = object.text;
            element.appendChild(h3);
            element.appendChild(document.createElement("hr"));
            const span = document.createElement("span");
            if (object.color) span.style.color = object.color
            element.appendChild(span);
            object.span = span;
            if (object.diff !== undefined) {
                element.appendChild(document.createElement("hr"));
                const diff = document.createElement("span");
                if (object.color) diff.style.color = object.color
                diff.innerHTML = "( dB)";
                element.appendChild(diff);
                object.diffElement = diff;
            }
            if (object.unit) {
                element.appendChild(document.createElement("hr"));
                const unit = document.createElement("span");
                if (object.color) unit.style.color = object.color
                unit.innerHTML = object.unit;
                element.appendChild(unit);
            }
        }
    }
}
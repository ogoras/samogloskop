import { StatsView } from "./StatsView.js";

export class SilenceView extends StatsView {
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
        },
        range: {
            text: "Rozpiętość: ",
            unit: "dB",
            roundFunction: (x) => x.toFixed(2),
            color: "rgb(0, 0, 180)"
        }
    }

    constructor(div, timeRequired) {
        super();
        this.div = div;
        this.timeRequired = timeRequired;
        let divStack = this.divStack = div.querySelector(".center").querySelector(".stack");
        this.h2 = divStack.querySelector("h2");
        this.recordingStarted();
        // remove the p element
        divStack.querySelector("p").remove();
        let progressBar = this.progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar");
        divStack.appendChild(progressBar);
        let progress = this.progress = document.createElement("div");
        progress.classList.add("progress");
        progressBar.appendChild(progress);
        this.addStatsElements();
    }

    recordingStarted() {
        this.h2.innerHTML = "Nagrywanie ciszy, nie odzywaj się...";
    }

    recordingStopped() {
        this.h2.innerHTML = "Nagrywanie ciszy wstrzymane.";
    }
}
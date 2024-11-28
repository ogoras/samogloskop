import StatsView from "./StatsView.js";
import ProgressBar from "../../visualization/ProgressBar.js";

export default class SilenceView extends StatsView {
    div;
    h2;

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
        },
        range: {
            text: "Rozpiętość: ",
            unit: "dB",
            roundFunction: (x) => x.toFixed(2),
            color: "rgb(0, 0, 180)"
        }
    }

    constructor(controller, view) {
        super(controller);
        this.div = view.div;
        this.timeRequired = controller.calibrationTime; // TODO set this
        let divStack = this.divStack = view.divStack;
        this.h2 = divStack.querySelector("h2");
        this.recordingStarted();
        // remove the p element
        divStack.querySelector("p").remove();
        this.progressBar = new ProgressBar(divStack);
        this.addStatsElements();
    }

    recordingStarted() {
        super.recordingStarted();
        this.h2.innerHTML = "Nagrywanie ciszy, nie odzywaj się...";
    }

    recordingStopped() {
        super.recordingStopped();
        this.h2.innerHTML = "Nagrywanie ciszy wstrzymane.";
    }
}
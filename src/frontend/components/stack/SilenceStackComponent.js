import StatsStackComponent from "./StatsStackComponent.js";

export default class SilenceStackComponent extends StatsStackComponent {
    constructor(prev, timeRequired) {
        super(prev, timeRequired);

        this.stats.range = {
            text: "Rozpiętość: ",
            unit: "dB",
            roundFunction: (x) => x.toFixed(2),
            color: "rgb(0, 0, 180)"
        }

        this.addStatsElements();

        this.recordingStarted();
    }

    recordingStarted() {
        this.h2.innerHTML = "Nagrywanie ciszy, nie odzywaj się...";
    }

    recordingStopped() {
        this.h2.innerHTML = "Nagrywanie ciszy wstrzymane.";
    }
}
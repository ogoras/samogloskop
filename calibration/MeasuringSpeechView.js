import { tonguetwisters } from "./tonguetwisters.js";
import { choose } from "../util/choose.js";

export class MeasuringSpeechView {
    silenceStats = {
        time: {
            text: "Nagrano głosu: ",
            unit: "s",
            stepsElapsed: 0,
            value: 0,
            roundFunction: (x) => x.toFixed(1),
        },
        min: {
            text: "Minimum: ",
            roundFunction: (x) => x ? x.toExponential(2) : "0",
            color: "rgb(80, 0, 80)",
            diff: 0
        },
        max: {
            text: "Maksimum: ",
            roundFunction: (x) => x.toExponential(2),
            color: "rgb(128, 0, 0)",
            diff: 0
        },
        mean: {
            text: "Średnia: ",
            roundFunction: (x) => x.toExponential(2),
            color: "rgb(104, 0, 40)",
            diff: 0
        }
    }

    #speechDetected = false;

    set speechDetected(value) {
        if (!value) throw new Error("Can't unset speechDetected");
        this.#speechDetected = value;
        this.recordingStarted();
        this.resetStatsElements();
    }

    constructor(view) {
        this.timeRequired = view.timeRequired;

        this.div = view.div;
        this.h2 = view.h2;
        this.progressBar = view.progressBar;
        this.progress = view.progress;
        this.progressBar.style.backgroundColor = window.getComputedStyle(this.progress).backgroundColor;
        this.progress.style.width = "0%";
        this.progress.style.backgroundColor = "lightblue";
        this.h2.innerHTML = "Nagranie ciszy zakończone. Teraz mów cokolwiek, głośno i wyraźnie, do mikrofonu przez 10 sekund..."
        let divStack = this.div.querySelector(".center").querySelector(".stack");
        // add a p element to the divStack between h2 and progressBar
        let p = document.createElement("p");
        p.innerHTML = "<b>Jeśli nie wiesz, co powiedzieć, spróbuj tych łamańców językowych:</b>";
        divStack.insertBefore(p, this.progressBar);
        // add two random tongue twisters after the p element
        let choices = choose(tonguetwisters, 2);
        for (let choice of choices) {
            let p = document.createElement("p");
            p.innerHTML = choice;
            divStack.insertBefore(p, this.progressBar);
        }
    }

    updateProgress(time) {
        if (this.startTime === undefined) throw new Error("startTime is not set");
        let timeElapsed = time - this.startTime;
        this.progress.style.width = timeElapsed >= this.timeRequired 
            ? "100%" 
            : (timeElapsed / this.timeRequired * 100) + "%";
    }

    recordingStarted() {
        this.h2.innerHTML = this.#speechDetected 
            ? "Mów dalej, głośno i wyraźnie..."
            : "Mów cokolwiek do mikrofonu, głośno i wyraźnie..."
    }

    recordingStopped() {
        this.h2.innerHTML = "Nagrywanie mowy wstrzymane.";
    }

    resetStatsElements() {
        // remove everythin after the progressBar
        let divStack = this.div.querySelector(".center").querySelector(".stack");
        let progressBar = this.progressBar;
        while (divStack.lastChild !== progressBar) {
            divStack.removeChild(divStack.lastChild);
        }
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
            if (object.diff !== undefined) {
                element.appendChild(document.createElement("hr"));
                let diff = document.createElement("span");
                if (object.color) diff.style.color = object.color
                diff.innerHTML = "( dB)";
                element.appendChild(diff);
                object.diffElement = diff;
            }
        }
    }

    update(intensityStats) {
        this.silenceStats.time.value = intensityStats.timeElapsed;
        this.silenceStats.min.value = intensityStats.zeroReached ? 0 : intensityStats.min;
        this.silenceStats.min.diff = intensityStats.diff(0);
        this.silenceStats.max.value = intensityStats.max;
        this.silenceStats.max.diff = intensityStats.diff(1);
        this.silenceStats.mean.value = intensityStats.mean;
        this.silenceStats.mean.diff = intensityStats.diff(2);
        for (let key in this.silenceStats) {
            let object = this.silenceStats[key];
            object.span.innerHTML = object.roundFunction(object.value);
            if (object.diff !== undefined)  {
                object.diffElement.innerHTML = `(${object.diff > 0 ? "+" : ""}${object.diff.toFixed(2)} dB)`;
            }
        }
    }
}
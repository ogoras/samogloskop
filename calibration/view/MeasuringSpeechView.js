import { tonguetwisters } from "./tonguetwisters.js";
import { choose } from "../../util/choose.js";
import { StatsView } from "./StatsView.js";

export class MeasuringSpeechView extends StatsView {
    #speechDetected = false;
    startTime = undefined;

    set speechDetected(value) {
        if (!value) throw new Error("Can't unset speechDetected");
        this.#speechDetected = value;
        this.recordingStarted();
        this.resetStatsElements();
    }

    constructor(view) {
        super();
        this.silenceStats.min.diff = 0;
        this.silenceStats.max.diff = 0;
        this.silenceStats.mean.diff = 0;
        this.silenceStats.time.text = "Nagrano głosu: ";

        this.timeRequired = view.timeRequired;

        this.div = view.div;
        let divStack = this.divStack = view.divStack;
        this.h2 = view.h2;
        let progressBar = this.progressBar = view.progressBar;
        progressBar.color = "lightblue";
        progressBar.reset();
        this.h2.innerHTML = "Nagranie ciszy zakończone. Teraz mów cokolwiek, głośno i wyraźnie, do mikrofonu przez 10 sekund..."
        // add a p element to the divStack between h2 and progressBar
        let p = document.createElement("p");
        p.innerHTML = "<b>Jeśli nie wiesz, co powiedzieć, spróbuj tych łamańców językowych:</b>";
        divStack.insertBefore(p, this.progressBar.element);
        // add two random tongue twisters after the p element
        let choices = choose(tonguetwisters, 2);
        for (let choice of choices) {
            let p = document.createElement("p");
            p.innerHTML = choice;
            divStack.insertBefore(p, this.progressBar.element);
        }
    }

    recordingStarted() {
        if (this.finished) {
            this.h2.innerHTML = "Pomiar poziomu głosu zakończony. Za chwilę przejdziesz do kalibracji samogłosek...";
        }
        else {
            this.h2.innerHTML = this.#speechDetected 
                ? "Mów dalej, głośno i wyraźnie..."
                : "Mów cokolwiek do mikrofonu, głośno i wyraźnie..."
        }
    }

    recordingStopped() {
        if (this.finished) {
            this.h2.innerHTML = "Włącz mikrofon, aby kontynuować...";
        }
        else {
            this.h2.innerHTML = "Nagrywanie mowy wstrzymane.";
        }
    }

    resetStatsElements() {
        // remove everything after the progressBar
        let divStack = this.div.querySelector(".center").querySelector(".stack");
        while (divStack.lastChild !== this.progressBar.element) {
            divStack.removeChild(divStack.lastChild);
        }
        this.addStatsElements();
    }

    finish() {
        this.finished = true;
        this.h2.innerHTML = "Pomiar poziomu głosu zakończony. Za chwilę przejdziesz do kalibracji samogłosek...";
        this.progressBar.color = "crimson";
        this.progressBar.enableTransition(100);
        this.progressBar.reset();
        // remove all the p elements
        let divStack = this.div.querySelector(".center").querySelector(".stack");
        let ps = divStack.querySelectorAll("p");
        for (let p of ps) {
            p.remove();
        }
    }
}
import tonguetwisters from "../../../const/tonguetwisters.js";
import choose from "../../../util/choose.js";
import StatsView from "./StatsView.js";
import { STATE_NAMES, STATES } from "../../../const/states.js";
import ProgressBar from "../../../visualization/ProgressBar.js";

export default class MeasuringSpeechView extends StatsView {
    div;
    h2;
    finished = false;

    #speechDetected = false;

    /**
     * @param {boolean} value
     */
    set speechDetected(value) {
        if (!value) throw new Error("Can't unset speechDetected");
        this.#speechDetected = value;
        this.recordingStarted();
        this.resetStatsElements();
    }

    constructor(onStateChange, arg, args, recycle = false) {
        super();
        if (recycle) {
            let view = arg;
            let stats = this.stats;
            stats.min.diff = 0;
            stats.max.diff = 0;
            stats.mean.diff = 0;
            stats.time.text = "Nagrano głosu: ";

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
        else if (args.state === STATES.SPEECH_MEASURED) {
            let div = this.div = arg;
            let divStack = this.divStack = div.querySelector(".stack");
            this.h2 = document.createElement("h2");
            divStack.appendChild(this.h2);
            this.progressBar = new ProgressBar(divStack);
            this.finish();
            this.recordingStopped();
        }
        else throw new Error("Restoring MeasuringSpeechView with state " + STATE_NAMES[state] + " is not supported");
    }

    recordingStarted() {
        super.recordingStarted();
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
        super.recordingStopped();
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
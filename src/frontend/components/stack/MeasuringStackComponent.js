import StatsStackComponent from "./StatsStackComponent.js";
import tonguetwisters from "../../../const/tonguetwisters.js";
import choose from "../../../logic/util/choose.js";
import ProgressBar from "../../visualization/progress_bar/ProgressBar.js";

export default class MeasuringStackComponent extends StatsStackComponent {
    finished = false;
    #speechDetected = false;

    /**
     * @param {boolean} value
     */
    set speechDetected(value) {
        if (!value) throw new Error("Can't unset speechDetected");
        this.#speechDetected = value;
        this.resetStatsElements();
    }

    constructor(prev, timeRequired, stateToRecycle) {
        super(prev, timeRequired);

        if (stateToRecycle) {
            if (stateToRecycle.is("WAITING_FOR_SPEECH")) {
                const stats = this.stats;
                stats.min.diff = 0;
                stats.max.diff = 0;
                stats.mean.diff = 0;
                stats.time.text = "Nagrano głosu: ";

                const progressBar = this.progressBar;
                progressBar.color = "lightblue";
                progressBar.reset();

                this.h2.innerHTML = "Nagranie ciszy zakończone. Teraz mów cokolwiek, głośno i wyraźnie, do mikrofonu przez 10 sekund..."

                // add a p element to the divStack between h2 and progressBar
                const p = document.createElement("p");
                p.innerHTML = "<b>Jeśli nie wiesz, co powiedzieć, spróbuj tych łamańców językowych:</b>";
                this.insertBefore(p, progressBar);
                // add two random tongue twisters after the p element
                const choices = choose(tonguetwisters, 2);
                for (let choice of choices) {
                    const p = document.createElement("p");
                    p.innerHTML = choice;
                    this.insertBefore(p, progressBar);
                }
            } else if (stateToRecycle.is("SPEECH_MEASURED")) {
                this.finish();
            } else {
                throw new Error(`Can't recycle to state ${stateToRecycle}`);
            }
        } else {
            this.h2 = document.createElement("h2");
            this.appendChild(this.h2);
            this.insertBefore(this.h2, this.progressBar)
            this.finish();
            this.recordingStopped();
        }
    }

    recordingStarted() {
        super.recordingStarted?.();
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
        super.recordingStopped?.();
        if (this.finished) {
            this.h2.innerHTML = "Włącz mikrofon, aby kontynuować...";
        }
        else {
            this.h2.innerHTML = "Nagrywanie mowy wstrzymane.";
        }
    }

    resetStatsElements() {
        // remove everything after the progressBar
        const divStack = this.element;
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
        const ps = this.element.querySelectorAll("p");
        for (let p of ps) {
            p.remove();
        }
    }

    destroy() {
        // remove everything from the div stack except h2
        const divStack = this.element;
        while (divStack.lastChild !== this.h2) {
            divStack.removeChild(divStack.lastChild);
        }
    }
}
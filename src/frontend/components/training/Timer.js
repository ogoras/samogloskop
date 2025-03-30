import nullish from "../../../logic/util/nullish.js";
import Component from "../Component.js";
import ProgressBar from "../../visualization/progress_bar/ProgressBar.js";
import TARGET from "../../../const/TIME.js"
import convertSecondsToTimeString from "../../../logic/util/timeToString.js";

export default class Timer extends Component {
    running = false;

    constructor(container) {
        super("timer", null, container);
        this.hidden = true;
        this.span = document.createElement("span");
        this.element.appendChild(this.span);
        this.progressBar = new ProgressBar(this, "#00A000");
    }

    setTime(time) {
        this.time = time;
        this.span.innerHTML = `Dzisiaj ćwiczysz już: ${convertSecondsToTimeString(time)}`;

        if (this.reachedTarget === undefined) this.reachedTarget = time >= TARGET;
        else {
            const reachedTargetNow = time >= TARGET;
            if (reachedTargetNow && !this.reachedTarget) {
                this.reachedTarget = this.view.controller.checkIfDailyTargetReached();
            }
        }
        const percentage = Math.min(time / TARGET, 1) * 100;
        this.progressBar.progress = percentage;
    }

    show(timeMs) {
        this.hidden = false;
        if (!nullish(timeMs)) this.setTime(Math.floor(timeMs / 1000));
    }

    resume() {
        if (this.hidden) throw new Error("Tried to resume timer when it's not visible");
        if (this.interval) throw new Error("Timer already running");
        this.progressBar.startAnimation();
        this.running = true;
        this.interval = setInterval(() => this.setTime(this.time + 1), 1000);
    }

    pauseAndUpdate(timeMs) {
        if (this.hidden) throw new Error("Tried to pause and update timer when it's not visible");
        if (!this.interval) throw new Error("Timer not running");
        clearInterval(this.interval);
        this.interval = null;
        this.setTime(Math.floor(timeMs / 1000));

        this.progressBar.stopAnimation();
        this.running = false;
    }

    hide() {
        if (this.hidden) throw new Error("Tried to remove timer when it's not visible");
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.progressBar.stopAnimation();
        }
        this.hidden = true;
    }
};
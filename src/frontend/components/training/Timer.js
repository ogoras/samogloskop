import nullish from "../../../logic/util/nullish.js";
import Component from "../Component.js";
import ProgressBar from "../../visualization/progress_bar/ProgressBar.js";

export default class Timer extends Component {
    constructor(container) {
        super("timer", null, container);
        this.hidden = true;
        this.span = document.createElement("span");
        this.element.appendChild(this.span);
        this.progressBar = new ProgressBar(this, "#00A000");
    }

    setTime(time) {
        this.time = time;
        function twoDigits(num) { return num.toString().padStart(2, '0'); }
        const hh = Math.floor(time / 3600);
        const mm = twoDigits(Math.floor(time / 60) % 60);
        const ss = twoDigits(time % 60);
        this.span.innerHTML = `Dzisiaj ćwiczysz już: ${hh}:${mm}:${ss}`;

        const target = 30 * 60;
        const percentage = Math.min(time / target, 1) * 100;
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
        this.interval = setInterval(() => this.setTime(this.time + 1), 1000);
    }

    pauseAndUpdate(timeMs) {
        if (this.hidden) throw new Error("Tried to pause and update timer when it's not visible");
        if (!this.interval) throw new Error("Timer not running");
        clearInterval(this.interval);
        this.interval = null;
        this.setTime(Math.floor(timeMs / 1000));

        this.progressBar.stopAnimation();
    }

    hide() {
        if (!this.visible) throw new Error("Tried to remove timer when it's not visible");
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.progressBar.stopAnimation();
        }
        this.hidden = true;
    }
};
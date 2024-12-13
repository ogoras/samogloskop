import ProgressBar from "./ProgressBar.js";
export default class DoubleProgressBar extends ProgressBar {
    /**
     * @param {string} value
     */
    set color(value) {
        super.color = value;
        this.secondaryBar.style.backgroundColor = value;
    }
    /**
     * @param {number} percentage
     */
    set secondaryProgress(percentage) {
        this.secondaryBar.style.width = percentage + "%";
    }
    constructor(div, color) {
        super(div, color);
        this.secondaryBar = document.createElement("div");
        this.secondaryBar.classList.add("progress");
        //this.background.appendChild(this.secondaryBar);
        this.background.insertBefore(this.secondaryBar, this.bar);
        if (color) {
            this.secondaryBar.style.backgroundColor = color;
        }
        this.secondaryBar.style.opacity = 0.5;
    }
    reset() {
        super.reset();
        this.secondaryProgress = 0;
    }
}

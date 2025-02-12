import Component from "../../components/Component.js";

export default class ProgressBar extends Component {
    /**
     * @param {string} value
     */
    set color(value) {
        this.background.style.backgroundColor = window.getComputedStyle(this.bar).backgroundColor;
        this.bar.style.backgroundColor = value;
    }

    /**
     * @param {number} percentage
     */
    set progress(percentage) {
        this.bar.style.width = percentage + "%";
    }

    constructor(div, color) {
        super("progress-bar", null, div);
        const background = this.background = this.element;
        const bar = this.bar = document.createElement("div");
        bar.classList.add("progress");
        background.appendChild(bar);
        if (color) this.bar.style.backgroundColor = color;
    }

    reset() {
        this.progress = 0;
    }

    enableTransition(duration) {
        this.bar.style.transition = `width ${duration}ms`;
    }

    swapColors() {
        const tmp = window.getComputedStyle(this.background).backgroundColor;
        this.color = tmp;
    }
}
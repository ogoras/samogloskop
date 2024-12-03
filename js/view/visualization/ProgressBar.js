export default class ProgressBar {
    /**
     * @param {string} value
     */
    set color(value) {
        this.background.style.backgroundColor = window.getComputedStyle(this.bar).backgroundColor;
        this.bar.style.backgroundColor = value;
    }

    set progress(percentage) {
        this.bar.style.width = percentage + "%";
    }

    get element () {
        return this.background;
    }

    constructor(div, color) {
        const background = this.background = document.createElement("div");
        background.classList.add("progress-bar");
        div.appendChild(background);
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
}
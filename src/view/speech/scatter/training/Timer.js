import nullish from "../../../../logic/util/nullish.js";

export default class Timer {
    element = document.createElement("span");
    visible = false;

    constructor(container, nextSibling) {
        this.container = container;
        this.nextSibling = nextSibling;
        this.element.classList.add("timer");
    }

    setTime(time) {
        this.time = time;
        function twoDigits(num) { return num.toString().padStart(2, '0'); }
        const hh = Math.floor(time / 3600);
        const mm = twoDigits(Math.floor(time / 60) % 60);
        const ss = twoDigits(time % 60);
        this.element.innerHTML = `Ćwiczysz już: ${hh}:${mm}:${ss}`;
    }

    show(timeMs) {
        this.visible = true;
        this.container.insertBefore(this.element, this.nextSibling.div);
        if (!nullish(timeMs)) this.setTime(Math.floor(timeMs / 1000));
    }

    resume() {
        if (!this.visible) throw new Error("Tried to resume timer when it's not visible");
        if (this.interval) throw new Error("Timer already running");
        this.interval = setInterval(() => this.setTime(this.time + 1), 1000);
    }

    pauseAndUpdate(timeMs) {
        if (!this.visible) throw new Error("Tried to pause and update timer when it's not visible");
        if (!this.interval) throw new Error("Timer not running");
        clearInterval(this.interval);
        this.interval = null;
        this.setTime(Math.floor(timeMs / 1000));
    }

    hide() {
        if (!this.visible) throw new Error("Tried to remove timer when it's not visible");
        if (this.interval) clearInterval(this.interval);
        this.element.remove();
        this.visible = false;
    }
};
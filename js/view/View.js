export default class View {
    mainContainer = document.querySelector(".main-container");

    constructor(onStateChange) {
        if (this.constructor === View) throw new Error("Cannot instantiate abstract class View");
        this.onStateChange = onStateChange;
    }

    close(updates = {}) {
        this.onStateChange(updates);
    }
}
export default class View {
    constructor(onStateChange) {
        if (this.constructor === View) throw new Error("Cannot instantiate abstract class View");
        this.onStateChange = onStateChange;
    }

    close(updates = {}) {
        this.onStateChange(updates);
    }
}
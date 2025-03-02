import Component from "../Component.js";

export default class FormantsComponent extends Component {
    #empty = true;

    constructor(parent) {
        super("formants-container", "formants");
        this.parent = parent;
    }

    createCenterDiv() {
        if (!this.#empty) throw new Error("Trying to add div.center to non-empty FormantsComponent");

        this.centerComponent = new Component("center", null, this);
        this.#empty = false;

        return this.centerComponent;
    }

    clear() {
        super.clear();
        this.#empty = true;
    }
}
import Component from "../Component.js";

export default class FormantsComponent extends Component {
    #empty = true;

    constructor() {
        super("formants-container", "formants");
    }

    addDivStack() {
        if (!this.#empty) throw new Error("Trying to add div.stack to non-empty FormantsComponent");

        const centerDiv = document.createElement("div");
        centerDiv.classList.add("center");
        this.element.appendChild(centerDiv);
        const divStack = this.divStack = document.createElement("div");
        divStack.classList.add("stack");
        centerDiv.appendChild(divStack);

        this.#empty = false;
    }
}
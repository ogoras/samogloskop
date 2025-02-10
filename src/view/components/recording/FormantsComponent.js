import Component from "../Component.js";
import StackComponent from "../stack/StackComponent.js";

export default class FormantsComponent extends Component {
    #empty = true;

    constructor() {
        super("formants-container", "formants");
    }

    createStackComponent() {
        if (!this.#empty) throw new Error("Trying to add div.stack to non-empty FormantsComponent");

        const centerDiv = document.createElement("div");
        centerDiv.classList.add("center");
        this.element.appendChild(centerDiv);
        this.stackComponent = new StackComponent(centerDiv);

        this.#empty = false;

        return this.stackComponent;
    }
}
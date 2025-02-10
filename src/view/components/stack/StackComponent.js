import Component from "../Component.js";

export default class StackComponent extends Component {
    set innerHTML(value) {
        this.element.innerHTML = value;
        this.h2 = this.element.querySelector("h2");
        this.p = this.element.querySelector("p");
    }

    constructor(parent) {
        super("stack", null, parent);
    }
}
import Component from "../Component.js";

export default class StackComponent extends Component {
    set innerHTML(value) {
        this.element.innerHTML = value;
        this.h2 = this.element.querySelector("h2");
        this.p = this.element.querySelector("p");
    }

    constructor(parent, prev) {
        super("stack", null, parent);

        if (!parent) {
            this.element = prev.element; 
            this.h2 = prev.h2;
            this.parent = prev.parent;
            this.hidden = prev.hidden;
        }
    }

    removeAllExceptH2() {
        while (this.element.lastChild !== this.h2) {
            try {
                this.element.removeChild(this.element.lastChild);
            } catch (e) {
                console.log("Error removing last child, is it possible that h2 wasn't present?");
                console.log(e);
                return;
            }
        }
    }

    addH2() {
        this.h2 = document.createElement("h2");
        this.element.appendChild(this.h2);
    }
}
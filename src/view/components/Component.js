import View from "../View.js";

export default class Component {
    #hidden = false;
    element = document.createElement("div");

    /**
     * @param {boolean} value
     */
    set hidden(value) {
        this.#hidden = value;
        this.element.style.display = value ? "none" : null;
    }

    get hidden() { return this.#hidden; }

    constructor(className, id, parent = document.body) {
        this.parent = parent;
        if (this.constructor === Component) {
            throw new Error(`Cannot instantiate abstract class ${this.constructor.name}`);
        }

        if (className) this.element.classList.add(className);
        if (id) this.element.id = id;
        parent.appendChild(this.element);
    }

    get view() {
        let component = this;
        while (component.parent) {
            if (component.parent instanceof Component) {
                component = component.parent;
            }
            else if (component.parent instanceof View) {
                return component.parent;
            }
            else return null;
        }
    }

    appendChild(element) {
        this.element.appendChild(element);
    }

    destroy() {
        this.element.remove();
    }
}
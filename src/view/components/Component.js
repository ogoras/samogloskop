import View from "../View.js";

export default class Component {
    #hidden = false;

    /**
     * @param {boolean} value
     */
    set hidden(value) {
        this.#hidden = value;
        this.element.style.display = value ? "none" : null;
    }

    get hidden() { return this.#hidden; }

    constructor(className, id, parent = document.body, tagName = "div") {
        if (tagName === "svg") {
            this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        } else {
            this.element = document.createElement(tagName);
        }
        if (parent === null) return;
        
        this.parent = parent;
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
        if (element instanceof Component) {
            element.parent = this;
            element = element.element;
        }
        this.element.appendChild(element);
    }

    insertBefore(element, reference) {
        if (element instanceof Component) {
            element.parent = this;
            element = element.element;
        }
        if (reference instanceof Component) reference = reference.element
        this.element.insertBefore(element, reference);
    }

    after(element) {
        if (element instanceof Component) element = element.element;
        this.element.after(element);
    }

    destroy() {
        this.element.remove();
    }

    clear() {
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
    }
}
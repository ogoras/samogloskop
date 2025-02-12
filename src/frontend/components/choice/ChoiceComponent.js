import Component from "../Component.js";

export default class ChoiceComponent extends Component {
    constructor(
        parent,
        selectedIndex,
        extraAction,
        text,
        choices,
        container = parent.container
    ) {
        super(null, null, container);
        
        if (this.constructor === ChoiceComponent) {
            throw new Error(`Cannot instantiate abstract class ${this.constructor.name}`);
        }
        const p = document.createElement("p");
        p.innerHTML = text;
        this.element.appendChild(p);

        for (let i = 0; i < choices.length; i++) {
            const choice = choices[i];
            const button = document.createElement("button");
            if (i === selectedIndex) button.classList.add("selected");
            button.innerHTML = choice.text;
            if (choice.id) button.id = choice.id;
            button.onclick = () => {
                this.element.remove();
                parent.controller.choose(choice.returnValue);
                extraAction?.();
            }
            this.element.appendChild(button);
        }
    }
}
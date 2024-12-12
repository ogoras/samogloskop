import View from '../View.js';
export default class ChoiceView extends View {
    choiceElement = document.createElement("div");
    constructor(controller, text, choices, parentContainer, selectedIndex, extraAction) {
        super(controller);
        if (this.constructor === ChoiceView)
            throw new Error("Cannot instantiate abstract class ChoiceView");
        // check if parent.choose is a function
        if (typeof controller.choose !== "function")
            throw new Error("Controller must have a choose method");
        if (!parentContainer)
            parentContainer = document.querySelector(".main-container");
        const choiceElement = this.choiceElement;
        parentContainer.appendChild(choiceElement);
        const p = document.createElement("p");
        p.innerHTML = text;
        choiceElement.appendChild(p);
        for (let i = 0; i < choices.length; i++) {
            const choice = choices[i];
            const button = document.createElement("button");
            if (i === selectedIndex)
                button.classList.add("selected");
            button.innerHTML = choice.text;
            if (choice.id)
                button.id = choice.id;
            button.onclick = () => {
                this.choiceElement.remove();
                controller.choose(choice.returnValue);
                extraAction?.();
            };
            choiceElement.appendChild(button);
        }
    }
}

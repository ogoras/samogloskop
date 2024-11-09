import View from './View.js';

export default class ChoiceView extends View {
    choiceElement = document.createElement("div");

    constructor(onStateChange, text, choices, parent, selectedIndex) {
        super(onStateChange);
        if (this.constructor === ChoiceView) throw new Error("Cannot instantiate abstract class ChoiceView");

        if(!parent) parent = document.querySelector(".main-container");

        let choiceElement = this.choiceElement;
        parent.appendChild(choiceElement);
        
        let p = document.createElement("p");
        p.innerHTML = text;
        choiceElement.appendChild(p);

        for (let i = 0; i < choices.length; i++) {
            let choice = choices[i];
            let button = document.createElement("button");
            if (i === selectedIndex) button.classList.add("selected");
            button.innerHTML = choice.text;
            if (choice.id) button.id = choice.id;
            button.onclick = () => {
                this.close(choice.updates);
            }
            choiceElement.appendChild(button);
        }
    }

    close(updates) {
        this.choiceElement.remove();
        super.close(updates);
    }
}
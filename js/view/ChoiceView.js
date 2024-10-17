import { View } from './View.js';

export class ChoiceView extends View {
    choiceElement = document.createElement("div");

    constructor(onStateChange, text, choices) {
        super(onStateChange);
        if (this.constructor === ChoiceView) throw new Error("Cannot instantiate abstract class ChoiceView");

        let choiceElement = this.choiceElement;
        this.mainContainer.appendChild(choiceElement);
        
        let p = document.createElement("p");
        p.innerHTML = text;
        choiceElement.appendChild(p);

        for (let choice of choices) {
            let button = document.createElement("button");
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
export default class ChoiceComponent {
    choiceElement = document.createElement("div");
    
    constructor(
        parent,
        selectedIndex,
        extraAction,
        text,
        choices,
        container = parent.container
    ) {
        if (this.constructor === ChoiceComponent) {
            throw new Error("Cannot instantiate abstract class ConsentComponent");
        }
        const choiceElement = this.choiceElement;
        container.appendChild(choiceElement);
        
        const p = document.createElement("p");
        p.innerHTML = text;
        choiceElement.appendChild(p);

        for (let i = 0; i < choices.length; i++) {
            const choice = choices[i];
            const button = document.createElement("button");
            if (i === selectedIndex) button.classList.add("selected");
            button.innerHTML = choice.text;
            if (choice.id) button.id = choice.id;
            button.onclick = () => {
                this.choiceElement.remove();
                parent.controller.choose(choice.returnValue);
                extraAction?.();
            }
            choiceElement.appendChild(button);
        }
    }
}
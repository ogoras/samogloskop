import View from '../View.js';

export default class WelcomeBackView extends View {
    constructor(controller) {
        super(controller);

        let mainContainer = document.getElementsByClassName("main-container")[0];
        if (!mainContainer) {
            document.body.innerHTML = "<div class='main-container'></div>";
            mainContainer = document.getElementsByClassName("main-container")[0];
        }
        
        const div = document.createElement("div");
        div.id = "welcomeBack";
        div.classList.add("centered");
        mainContainer.appendChild(div);

        const h1 = document.createElement("h1");
        h1.innerHTML = "Witaj ponownie!";
        div.appendChild(h1);

        const p = document.createElement("p");
        p.innerHTML = this.controller.lsm.getStreak() ? `Kontynuuj ćwiczenie, aby dodać do swojej passy 🔥🔥 <b>${this.controller.lsm.getStreakString("genitive")}</b>.` : `Super, że jesteś z powrotem! Naciśnij na przycisk poniżej, aby zacząć dzisiejsze ćwiczenie.`;
        if (this.controller.lsm.howManyFullDays()) {
            p.innerHTML += ` ${this.controller.lsm.getFullDaysMessage()}`;
        }
        div.appendChild(p);

        const button = document.createElement("button");
        button.innerText = "Kontynuuj";
        button.onclick = () => {
            this.controller.startNewDay();
        };
        button.style.display = "block"
        button.style.margin = "1rem auto";
        button.style.color = "black"
        div.appendChild(button);

        const p2 = document.createElement("p");
        p2.innerHTML = "Tip: możesz sprawdzić, jak Twoje samogłoski się dotychczas poprawiły, wchodząc w <i>Ustawienia</i> &gt; <i>Sprawdź ponownie swoją wymowę</i>";
        div.appendChild(p2);
    }
}
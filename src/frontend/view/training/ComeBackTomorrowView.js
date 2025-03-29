import View from '../View.js';
import convertSecondsToTimeString from '../../../logic/util/timeToString.js';

export default class ComeBackTomorrowView extends View {
    constructor(controller) {
        super(controller);

        const mainContainer = document.getElementsByClassName("main-container")[0];
        
        const div = document.createElement("div");
        div.id = "comeBackTomorrow";
        div.classList.add("centered");
        mainContainer.appendChild(div);

        const h1 = document.createElement("h1");
        h1.innerHTML = "Przyjdź ponownie jutro";
        div.appendChild(h1);

        const p = document.createElement("p");
        p.innerHTML = `Twoje ćwiczenie dzisiaj zajęło wystarczająco długo (${convertSecondsToTimeString(Math.floor(controller.timeSpentInFocus / 1000))}). Wróć jutro, aby kontynuować naukę.`;
        div.appendChild(p);
    }
}
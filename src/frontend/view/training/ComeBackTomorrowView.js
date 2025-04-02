import View from '../View.js';
import convertSecondsToTimeString from '../../../logic/util/timeToString.js';
import TimeTableComponent from '../../components/training/TimeTableComponent.js';

export default class ComeBackTomorrowView extends View {
    constructor(controller) {
        super(controller);

        let mainContainer = document.getElementsByClassName("main-container")[0];
        if (!mainContainer) {
            document.body.innerHTML = "<div class='main-container'></div>";
            mainContainer = document.getElementsByClassName("main-container")[0];
        }
        
        const div = document.createElement("div");
        div.id = "comeBackTomorrow";
        div.classList.add("centered");
        mainContainer.appendChild(div);

        const h1 = document.createElement("h1");
        h1.innerHTML = "Przyjdź ponownie jutro";
        div.appendChild(h1);

        const p = document.createElement("p");
        p.innerHTML = `Twoje ćwiczenie dzisiaj zajęło wystarczająco długo (${convertSecondsToTimeString(Math.floor(controller.timeSpentInFocus / 1000))}). Wróć jutro, aby kontynuować swoją passę 🔥🔥 <b>${this.controller.lsm.getStreakString("genitive")}</b>. ${this.controller.lsm.getFullDaysMessage()}`;
        div.appendChild(p);
        p.style.marginBottom = "0.5em";

        this.button = document.createElement("button");
        this.button.innerText = "Zapisz stan aplikacji do pliku...";
        this.button.onclick = () => {
            this.controller.lsm.saveToFile(`samogloskop_zapis_${new Date().toISOString()}.json`);
        };
        this.button.style.display = "block";
        this.button.style.margin = "1rem auto";
        this.button.style.color = "#008000"
        div.appendChild(this.button);

        // center the table
        const centerDiv = document.createElement("div");
        centerDiv.style.display = "flex";
        centerDiv.style.justifyContent = "center";
        centerDiv.style.marginTop = "0.5em";
        div.appendChild(centerDiv);
    
        new TimeTableComponent(centerDiv, controller.lsm);
    }
}
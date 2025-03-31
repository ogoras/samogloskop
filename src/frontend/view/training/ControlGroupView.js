import View from "../View.js";
import Timer from "../../components/training/Timer.js";
import SelectedVowelDisplay from "../../components/training/SelectedVowelDisplay.js";
import MoreInfo from "../../components/MoreInfo.js";
import SettingsView from '../SettingsView.js';

export default class ControlGroupView extends View {
    #datasetAdded = false;

    constructor(controller) {
        document.body.innerHTML = "";
        document.body.style.padding = "1em";
        document.body.className = "";
        super(controller);
        
        this.h1 = document.createElement("h1");
        this.h1.innerText = "Jesteś w grupie kontrolnej!";
        this.h1.style.textAlign = "center";
        document.body.appendChild(this.h1);

        this.p = document.createElement("p");
        const dateOfPreTest = controller.lsm.foreignInitial.processedAt;
        const comeBackDate = new Date(dateOfPreTest.getFullYear(), dateOfPreTest.getMonth(), dateOfPreTest.getDate() + 8);
        this.p.innerHTML = `Losowy wybór przydzielił Cię do grupy kontrolnej. Oznacza to, że możesz sobie odpocząć i wrócić tutaj ${comeBackDate.getDay() === 2 ? "we" : "w"} <b>${comeBackDate.toLocaleDateString("pl-PL", {day: "numeric", month: "long", weekday: "long"})}</b>. Po badaniu otrzymasz link do pełnej wersji aplikacji.`
        document.body.appendChild(this.p);

        this.button = document.createElement("button");
        this.button.innerText = "Zapisz stan aplikacji do pliku...";
        this.button.onclick = () => {
            this.controller.lsm.saveToFile(`samogloskop_zapis_${new Date().toISOString()}.json`);
        };
        this.button.style.display = "block";
        this.button.style.margin = "0 auto";
        this.button.style.color = "#008000"
        document.body.appendChild(this.button);

        this.moreInfo = new MoreInfo();
        
        // this.timer = new Timer(document.body, this.moreInfo);
        // this.selectedVowelDisplay = new SelectedVowelDisplay(this, this.controller, document.body, this.moreInfo.element, false, true);

        // const buttonContainer = this.buttonContainer = document.createElement("div");
        // buttonContainer.style.display = "flex";
        // buttonContainer.style.justifyContent = "flex-end";
        // document.body.insertBefore(buttonContainer, this.selectedVowelDisplay.element);

        // const cornerButton = this.cornerButton = document.createElement("div");
        // cornerButton.classList.add("emoji-button");
        // this.changeCornerButton(false);
        // buttonContainer.appendChild(cornerButton);
    }

    addDatasets() {
        if (this.#datasetAdded) return;
        this.#datasetAdded = true;
    }

    addWords(words) {
        // this.selectedVowelDisplay.addWords(words);
    }

    openSettings() {
        document.body.style.padding = null;
        this.selectedVowelDisplay.hidden = true;
        this.timer.element.style.display = "none";
        this.moreInfo.hidden = true;
        this.buttonContainer.style.display = "none";
        this.popup = new SettingsView(this.controller.settingsController, this.closeSettings.bind(this));
    }

    closeSettings() {
        document.body.style.padding = "1em";
        this.selectedVowelDisplay.hidden = false;
        this.timer.element.style.display = null;
        this.moreInfo.hidden = false;
        this.buttonContainer.style.display = "flex";
    }

    changeCornerButton(fromSettingsToBack = true) {
        if (fromSettingsToBack) {
            this.cornerButton.innerHTML = "↩";
            this.cornerButton.style.paddingLeft = this.cornerButton.style.paddingRight = "0.25em";
            this.cornerButton.onclick = () => {
                this.changeCornerButton(false);
                this.selectedVowelDisplay.deselectVowel();
            }
        } else {
            this.cornerButton.innerHTML = "⚙️";
            this.cornerButton.style.paddingLeft = this.cornerButton.style.paddingRight = null;
            this.cornerButton.onclick = () => this.openSettings();
        }
    }
}
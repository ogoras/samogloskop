import View from "./View.js";
import PresetView from "./PresetView.js";
import { VERSION_MAJOR, VERSION_MINOR } from '../const/version.js';
import { STATES } from '../const/states.js';

export default class SettingsView extends View {
    constructor(onStateChange, closeCallback, formantProcessor) {
        super(onStateChange);
        this.closeCallback = closeCallback;
        this.formantProcessor = formantProcessor;

        // Settings:
        // 1a. localStorage consent status + link to privacy policy
        // 1b. Clear localStorage button
        // 2. Change preset
        // 3. List intensityStats with an option to recalibrate
        // Footer:
        // 1. Version number
        // 2. Link to GitHub
        // 3. Credits

        this.header = document.createElement("div");
        this.header.classList.add("header");
        document.body.appendChild(this.header);

        this.title = document.createElement("h1");
        this.title.innerHTML = "Ustawienia";
        this.header.appendChild(this.title);

        this.closeButton = document.createElement("div");
        this.closeButton.classList.add("emoji-button");
        this.closeButton.innerHTML = "↩";
        this.closeButton.onclick = this.close.bind(this);
        this.header.appendChild(this.closeButton);

        this.mainContainer = document.createElement("div");
        this.mainContainer.classList.add("main-container");
        document.body.appendChild(this.mainContainer);

        this.mainContainer.appendChild(this.createConsentSection());
        this.mainContainer.appendChild(this.createPresetSection());
        this.mainContainer.appendChild(this.createIntensityStatsSection());

        this.footer = document.createElement("div");
        this.footer.classList.add("footer");
        this.footer.classList.add("gray");
        document.body.appendChild(this.footer);
        this.footer.innerHTML = `Samogłoskop v${VERSION_MAJOR}.${VERSION_MINOR}`;
    }

    createConsentSection() {
        let div = document.createElement("div");

        let title = document.createElement("h2");
        title.classList.add("no-bottom-margin");
        title.innerHTML = "<b>Zgody</b>";
        div.appendChild(title);

        let consent = document.createElement("div");
        consent.classList.add("flex-oriented")
        let center = document.createElement("div");
        center.classList.add("center-auto");
        consent.appendChild(center);
        let info = document.createElement("p");
        center.appendChild(info);
        let button = document.createElement("button");
        button.classList.add("small");
        consent.appendChild(button);
        if (localStorage.getItem("accepted") === "true") {
            info.innerHTML = `<b>Zaakceptowano</b> przechowywanie danych w pamięci lokalnej.
                Po wycofaniu zgody odświeżenie strony bądź zamknięcie przeglądarki spowoduje usunięcie wszystkich Twoich danych. <a href ="privacy.html" target=”_blank”>Polityka prywatności</a>`;
            button.innerHTML = "Wycofaj zgodę i wyczyść dane z pamięci lokalnej";
            button.style = "color: #ff0000"
            button.addEventListener("click", () => {
                if (!confirm("Czy na pewno chcesz wycofać zgodę i wyczyścić dane z pamięci lokalnej? Utracisz wszystkie swoje dane.")) return;
                this.onStateChange({ accepted: false }, false);
                location.reload();
            });
            let secondButton = document.createElement("button");
            secondButton.innerHTML = "Tylko wycofaj zgodę";
            secondButton.style = "color: #a00000";
            secondButton.addEventListener("click", () => {
                if (!confirm("Czy na pewno chcesz wycofać zgodę na korzystanie z pamięci lokalnej? Utracisz wszystkie swoje dane po odświeżeniu lub zamknięciu okna przeglądarki.")) return;
                this.onStateChange({ accepted: false }, false);

                let nextElement = div.nextElementSibling;
                div.remove();
                this.mainContainer.insertBefore(this.createConsentSection(), nextElement);
            });
            secondButton.classList.add("small");
            consent.appendChild(secondButton);
        }
        else {
            info.innerHTML = `<b>Nie wyrażono zgody</b> na przechowywanie danych w pamięci lokalnej. Odświeżenie strony bądź zamknięcie przeglądarki spowoduje usunięcie wszystkich Twoich danych. <a href ="privacy.html" target=”_blank”>Polityka prywatności</a>`;
            button.innerHTML = "Wyraź zgodę na przechowywanie danych w pamięci lokalnej";
            button.style = "color: #008000"
            button.addEventListener("click", () => {
                this.onStateChange({ accepted: true }, false);

                let nextElement = div.nextElementSibling;
                div.remove();
                this.mainContainer.insertBefore(this.createConsentSection(), nextElement);
            });
        }
        div.appendChild(consent);
        return div;
    }

    createPresetSection() {
        let div = document.createElement("div");

        let title = document.createElement("h2");
        title.classList.add("no-bottom-margin");
        title.innerHTML = "<b>Kategoria głosu</b>";
        div.appendChild(title);

        let presetSelection = new PresetView((updates) => {
            this.onStateChange(updates, false);
            
            let nextElement = div.nextElementSibling;
            div.remove();
            this.mainContainer.insertBefore(this.createPresetSection(), nextElement);
        }, div, this.formantProcessor.preset);

        if (this.formantProcessor.userVowels?.gatheredAnything) {
            let notice = document.createElement("p");
            notice.innerHTML = "Uwaga: Zmiana kategorii głosu ma wpływ tylko na przyszłe nagrania. Wszystkie dotychczas zebrane dane pozostaną niezmienione.";
            notice.style = "color: #a00000";
            div.appendChild(notice);
        }

        return div;
    }

    createIntensityStatsSection() {
        return document.createElement("div");
    }

    close() {
        this.header.remove();
        this.mainContainer.remove();
        this.footer.remove();
        this.closeCallback();
    }
}
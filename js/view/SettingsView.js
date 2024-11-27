import View from "./View.js";
import PresetView from "./PresetView.js";
import { VERSION_MAJOR, VERSION_MINOR, PATCH } from '../const/version.js';
import { STATES } from '../const/states.js';

export default class SettingsView extends View {
    #state;
    get state() {
        return this.#state;
    }
    set state(value) {
        throw new Error("State is read-only");
    }
    
    constructor(onStateChange, closeCallback, args) {
        super(onStateChange);
        this.closeCallback = closeCallback;
        this.preset = args.preset;
        this.userVowels = args.userVowels;
        this.intensityStats = args.intensityStats;
        this.#state = args.state;

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
        if (this.intensityStats.isCalibrated) {
            this.mainContainer.appendChild(this.createIntensityStatsSection());
        }
        if (this.state >= STATES.CONFIRM_VOWELS) {
            this.mainContainer.appendChild(this.createDeleteVowelsSection());
        }

        this.footer = document.createElement("div");
        this.footer.classList.add("footer");
        this.footer.classList.add("gray");
        document.body.appendChild(this.footer);
        this.footer.innerHTML = `Samogłoskop v${VERSION_MAJOR}.${VERSION_MINOR}.${PATCH}`;
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
        }, div, this.preset);

        if (this.userVowels?.gatheredAnything) {
            let notice = document.createElement("p");
            notice.innerHTML = "Uwaga: Zmiana kategorii głosu ma wpływ tylko na przyszłe nagrania. Wszystkie dotychczas zebrane dane pozostaną niezmienione.";
            notice.style = "color: #a00000";
            div.appendChild(notice);
        }

        return div;
    }

    createIntensityStatsSection() {
        let div = document.createElement("div");

        let title = document.createElement("h2");
        title.classList.add("no-bottom-margin");
        title.innerHTML = "<b>Kalibracja głośności</b>";
        div.appendChild(title);

        let stats = this.intensityStats;
        let statsInfo = document.createElement("div");
        statsInfo.classList.add("flex-oriented");
        statsInfo.style = "align-items: center";
        [stats.silenceStats, stats.speechStats].forEach((stats, index) => {
            let statsDiv = document.createElement("div");
            statsDiv.classList.add("center-auto");
            let title = document.createElement("h4");
            title.innerHTML = index == 0 ? "Poziomy ciszy: " : "Poziomy mowy: ";
            let statsP = document.createElement("p");
            statsP.innerHTML = `<span>${stats.min.toExponential(2)}</span> / <span>${stats.mean.toExponential(2)}</span> / <span>${stats.max.toExponential(2)}</span>`;
            statsDiv.appendChild(title);
            statsDiv.appendChild(statsP);
            statsInfo.appendChild(statsDiv);
        });
        let button = document.createElement("button");
        button.innerHTML = "Kalibruj ponownie";
        button.classList.add("small");
        button.onclick = () => {
            this.close();
            this.onStateChange({ tempState: STATES.NO_SAMPLES_YET }, true);
        }
        statsInfo.appendChild(button);
        div.appendChild(statsInfo);
        let notice = document.createElement("p");
        notice.innerHTML = "Kalibruj ponownie, jeśli używasz innego mikrofonu, jesteś teraz w innym otoczeniu albo po prostu uważasz, że aplikacja nie wychwytuje dobrze, kiedy mówisz.";
        div.appendChild(notice);

        return div;
    }

    createDeleteVowelsSection() {
        let div = document.createElement("div");

        let title = document.createElement("h2");
        title.classList.add("no-bottom-margin");
        title.innerHTML = "<b>Wyczyść dane o samogłoskach</b>";
        div.appendChild(title);

        let container = document.createElement("div");
        container.classList.add("flex-oriented");
        div.appendChild(container);

        let button = document.createElement("button");
        button.innerHTML = "Wyczyść dane o Twoich polskich samogłoskach";
        button.classList.add("small");
        button.style = "color: #a00000";
        button.onclick = () => {
            if (!confirm("Czy na pewno chcesz usunąć wszystkie dane o Twoich polskich samogłoskach?")) return;
            localStorage.removeItem("userVowels");
            localStorage.setItem("state", "SPEECH_MEASURED");
            location.reload();
        }
        container.appendChild(button);

        let notice = document.createElement("div");
        notice.classList.add("center-auto");
        notice.innerHTML = "<p>Uwaga: Usunięcie zebranych samogłosek automatycznie odświeża stronę i kieruje do ponownego nagrania próbek mowy.</p>";
        notice.style = "color: #a00000";
        container.appendChild(notice);

        return div;
    }

    close() {
        this.header.remove();
        this.mainContainer.remove();
        this.footer.remove();
        this.closeCallback();
    }
}
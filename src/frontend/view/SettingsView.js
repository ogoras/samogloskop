import View from "./View.js";
import PresetComponent from "../components/choice/PresetComponent.js";
import { VERSION_MAJOR, VERSION_MINOR, VERSION_PATCH } from '../../const/version.js';
import State from "../../const/enum/State.js";
import HELP_VIDEO_ID from "../../const/Help.js";
import DAILY_TARGET from "../../const/TIME.js";

export default class SettingsView extends View {
    #state;

    get state() {
        return this.#state;
    }
    set state(value) {
        throw new Error("State is read-only");
    }
    
    constructor(controller, closeCallback) {
        super(controller);
        this.closeCallback = closeCallback;
        this.preset = controller.lsm.preset;
        this.nativeVowels = controller.nativeVowels;
        this.intensityStats = controller.intensityStats;
        this.#state = controller.lsm.state;

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

        this.mainContainer.appendChild(this.createHelpSection());
        this.mainContainer.appendChild(this.createConsentSection());
        this.mainContainer.appendChild(this.createPresetSection());
        if (this.intensityStats?.isCalibrated && !controller.sm.onTempState) {
            this.mainContainer.appendChild(this.createIntensityStatsSection());
        }
        if (this.state.is("CONFIRM_VOWELS")) {
            this.mainContainer.appendChild(this.createDeleteVowelsSection());
        } else if (controller.sm.state.is("TRAINING")) {
            this.mainContainer.appendChild(this.createRetestSection());
        }
        this.mainContainer.appendChild(this.createSaveLoadSection());
        this.mainContainer.appendChild(this.createTrackedTimeSection())

        this.footer = document.createElement("div");
        this.footer.classList.add("footer");
        this.footer.classList.add("gray");
        document.body.appendChild(this.footer);
        this.footer.innerHTML = `Samogłoskop v${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}`;
    }

    createHelpSection() {
        const div = document.createElement("div");

        const title = document.createElement("h2");
        title.innerHTML = "<b>Pomoc</b>";
        div.appendChild(title);

        const instructionVideoLink = document.createElement("a");
        instructionVideoLink.innerHTML = "Obejrzyj filmik instruktażowy";
        instructionVideoLink.href = `https://www.youtube.com/watch?v=${HELP_VIDEO_ID}`;
        instructionVideoLink.target = "_blank";
        instructionVideoLink.style.margin = "0.5em";
        div.appendChild(instructionVideoLink);

        return div;
    }

    createConsentSection() {
        const div = document.createElement("div");

        const title = document.createElement("h2");
        title.classList.add("no-bottom-margin");
        title.innerHTML = "<b>Zgody</b>";
        div.appendChild(title);

        const consent = document.createElement("div");
        consent.classList.add("flex-oriented")
        const center = document.createElement("div");
        center.classList.add("center-auto");
        consent.appendChild(center);
        const info = document.createElement("p");
        center.appendChild(info);
        const button = document.createElement("button");
        button.classList.add("small");
        consent.appendChild(button);
        if (localStorage.getItem("accepted") === "true") {
            info.innerHTML = `<b>Zaakceptowano</b> przechowywanie danych w pamięci lokalnej.
                Po wycofaniu zgody odświeżenie strony bądź zamknięcie przeglądarki spowoduje usunięcie wszystkich Twoich danych. <a href ="privacy.html" target=”_blank”>Polityka prywatności</a>`;
            button.innerHTML = "Wycofaj zgodę i wyczyść dane z pamięci lokalnej";
            button.style = "color: #ff0000"
            button.addEventListener("click", () => {
                if (!confirm("Czy na pewno chcesz wycofać zgodę i wyczyścić dane z pamięci lokalnej? Utracisz wszystkie swoje dane.")) return;
                this.controller.lsm.clear();
                location.reload();
            });
            const secondButton = document.createElement("button");
            secondButton.innerHTML = "Tylko wycofaj zgodę";
            secondButton.style = "color: #a00000";
            secondButton.addEventListener("click", () => {
                if (!confirm("Czy na pewno chcesz wycofać zgodę na korzystanie z pamięci lokalnej? Utracisz wszystkie swoje dane po odświeżeniu lub zamknięciu okna przeglądarki.")) return;
                this.controller.lsm.dataConsentGiven = false;

                const nextElement = div.nextElementSibling;
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
                this.controller.lsm.dataConsentGiven = true;

                const nextElement = div.nextElementSibling;
                div.remove();
                this.mainContainer.insertBefore(this.createConsentSection(), nextElement);
            });
        }
        div.appendChild(consent);
        return div;
    }

    createPresetSection() {
        const div = document.createElement("div");

        const title = document.createElement("h2");
        title.classList.add("no-bottom-margin");
        title.innerHTML = "<b>Kategoria głosu</b>";
        div.appendChild(title);
        
        new PresetComponent(
            this,
            this.controller.lsm.preset.index,
            () => {
                const nextElement = div.nextElementSibling;
                div.remove();
                this.mainContainer.insertBefore(this.createPresetSection(), nextElement);
            },
            div
        );

        if (this.nativeVowels?.gatheredAnything) {
            const notice = document.createElement("p");
            notice.innerHTML = "Uwaga: Zmiana kategorii głosu ma wpływ tylko na przyszłe nagrania. Wszystkie dotychczas zebrane dane pozostaną niezmienione.";
            notice.style = "color: #a00000";
            div.appendChild(notice);
        }

        return div;
    }

    createIntensityStatsSection() {
        const div = document.createElement("div");

        const title = document.createElement("h2");
        title.classList.add("no-bottom-margin");
        title.innerHTML = "<b>Kalibracja głośności</b>";
        div.appendChild(title);

        const stats = this.intensityStats;
        const statsInfo = document.createElement("div");
        statsInfo.classList.add("flex-oriented");
        statsInfo.style = "align-items: center";
        [stats.silenceStats, stats.speechStats].forEach((stats, index) => {
            const statsDiv = document.createElement("div");
            statsDiv.classList.add("center-auto");
            const title = document.createElement("h4");
            title.innerHTML = index == 0 ? "Poziomy ciszy: " : "Poziomy mowy: ";
            const statsP = document.createElement("p");
            statsP.innerHTML = `<span>${stats.min.toExponential(2)}</span> / <span>${stats.mean.toExponential(2)}</span> / <span>${stats.max.toExponential(2)}</span>`;
            statsDiv.appendChild(title);
            statsDiv.appendChild(statsP);
            statsInfo.appendChild(statsDiv);
        });
        const button = document.createElement("button");
        button.innerHTML = "Kalibruj ponownie";
        button.classList.add("small");
        button.onclick = () => {
            this.close();
            this.controller.recalibrate();
        }
        statsInfo.appendChild(button);
        div.appendChild(statsInfo);
        const notice = document.createElement("p");
        notice.innerHTML = "Kalibruj ponownie, jeśli używasz innego mikrofonu, jesteś teraz w innym otoczeniu albo po prostu uważasz, że aplikacja nie wychwytuje dobrze, kiedy mówisz.";
        div.appendChild(notice);

        return div;
    }

    createDeleteVowelsSection() {
        const div = document.createElement("div");

        const title = document.createElement("h2");
        title.classList.add("no-bottom-margin");
        title.innerHTML = "<b>Wyczyść dane o samogłoskach</b>";
        div.appendChild(title);

        const container = document.createElement("div");
        container.classList.add("flex-oriented");
        div.appendChild(container);

        const button = document.createElement("button");
        button.innerHTML = "Wyczyść dane o Twoich polskich samogłoskach";
        button.classList.add("small");
        button.style = "color: #a00000";
        button.onclick = () => {
            if (!confirm("Czy na pewno chcesz usunąć wszystkie dane o Twoich polskich samogłoskach?")) return;
            this.controller.lsm.nativeVowels = undefined;
            this.controller.lsm.state = State.get("SPEECH_MEASURED");
            location.reload();
        }
        container.appendChild(button);

        const notice = document.createElement("div");
        notice.classList.add("center-auto");
        notice.innerHTML = "<p>Uwaga: Usunięcie zebranych samogłosek automatycznie odświeża stronę i kieruje do ponownego nagrania próbek mowy.</p>";
        notice.style = "color: #a00000";
        container.appendChild(notice);

        return div;
    }

    createRetestSection() {
        const div = document.createElement("div");

        const title = document.createElement("h2");
        title.innerHTML = "<b>Sprawdź ponownie swoją wymowę</b>";
        div.appendChild(title);

        const container = document.createElement("div");
        container.classList.add("flex-oriented");
        div.appendChild(container);

        const button = document.createElement("button");
        button.innerHTML = "Sprawdź ponownie swoje angielskie samogłoski";
        button.classList.add("small");
        button.onclick = () => {
            this.close();
            this.controller.retest();
        }
        container.appendChild(button);

        return div;
    }

    createSaveLoadSection() {
        const div = document.createElement("div");

        const title = document.createElement("h2");
        title.innerHTML = "<b>Zapisz lub wczytaj</b>";
        div.appendChild(title);

        const container = document.createElement("div");
        container.classList.add("flex-oriented");
        div.appendChild(container);

        const saveButton = document.createElement("button");
        saveButton.innerHTML = "Zapisz stan aplikacji do pliku...";
        saveButton.classList.add("small");
        saveButton.onclick = () => {
            if (!this.controller.lsm.dataConsentGiven) {
                alert("Niestety, ta funkcja działa tylko, jeśli najpierw wyrazisz zgodę na przechowywanie danych w pamięci lokalnej.");
                return;
            }
            this.controller.save();
        }
        saveButton.style.color = "#008000";
        container.appendChild(saveButton);

        const loadButton = document.createElement("button");
        loadButton.innerHTML = "Wczytaj stan aplikacji z pliku...";
        loadButton.classList.add("small");
        loadButton.onclick = () => {
            if (!this.controller.lsm.dataConsentGiven) {
                alert("Niestety, ta funkcja działa tylko, jeśli najpierw wyrazisz zgodę na przechowywanie danych w pamięci lokalnej.");
                return;
            }
            if (!confirm("Czy na pewno chcesz wczytać stan aplikacji z pliku? Wszystkie niezapisane dane zostaną utracone.")) return;
            this.controller.load();
        }
        loadButton.style.color = "#0000ff";
        container.appendChild(loadButton);

        return div;
    }

    createTrackedTimeSection() {
        const div = document.createElement("div");

        const title = document.createElement("h2");
        title.innerHTML = "<b>Śledzenie czasu</b>";
        div.appendChild(title);

        const container = document.createElement("div");
        container.classList.add("flex-oriented");
        container.style.gap = "0.5em";
        div.appendChild(container);

        const center = document.createElement("div");
        center.classList.add("center-auto");
        container.appendChild(center);

        const p = document.createElement("p");
        const lsm = this.controller.lsm;
        const timeSpent = lsm.timeSpentInTraining;
        let streak = 0;
        let date = new Date();
        date = new Date(date.getTime() - 86400000);
        while (timeSpent[lsm.dateToString(date)] >= DAILY_TARGET * 1000) {
            streak++;
            date = new Date(date.getTime() - 86400000);
        }
        p.innerHTML = `Aplikacja śledzi, ile czasu spędzasz z nią każdego dnia.${streak ? ` Twoja dotychczasowa passa 🔥🔥 to ${streak} ${streak == 1 ? "dzień" : "dni"}.` : ""}`;
        center.appendChild(p);

        const table = document.createElement("table");
        table.classList.add("time-table");
        const tableHeader = document.createElement("tr");
        const dateHeader = document.createElement("th");
        dateHeader.innerHTML = "Data";
        const timeHeader = document.createElement("th");
        timeHeader.innerHTML = "Czas";
        tableHeader.appendChild(dateHeader);
        tableHeader.appendChild(timeHeader);
        table.appendChild(tableHeader);

        const datesTrackedSoFar = Object.keys(timeSpent);
        datesTrackedSoFar.sort();
        for (const dateString of datesTrackedSoFar) {
            const time = timeSpent[dateString];
            const row = document.createElement("tr");
            const dateCell = document.createElement("td");
            dateCell.innerHTML = dateString;
            const timeCell = document.createElement("td");
            timeCell.innerHTML = `${Math.floor(time / 1000 / 60)} min`;
            row.appendChild(dateCell);
            row.appendChild(timeCell);
            table.appendChild(row);
        }
        container.appendChild(table);

        return div;
    }

    close() {
        this.header.remove();
        this.mainContainer.remove();
        this.footer.remove();
        this.closeCallback();
    }
}
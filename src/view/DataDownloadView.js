import View from "./View.js";

export default class DataDownloadView extends View {
    constructor(controller) {
        super(controller);

        // start with a clean slate
        document.body.innerHTML = "";

        const parentContainer = document.createElement("div");
        parentContainer.classList.add("center");
        document.body.appendChild(parentContainer);

        this.container = document.createElement("div");
        this.container.classList.add("stack");
        parentContainer.appendChild(this.container);

        // Add a title
        const title = document.createElement("h1");
        title.innerHTML = "Jeszcze jeden krok!";
        this.container.appendChild(title);

        // Add a paragraph
        const p = document.createElement("p");
        p.innerHTML = `Aby zakończyć swój udział w badaniu, pobierz swoje dane i załącz je w ankiecie.`;
        this.container.appendChild(p);

        // Add a button to download the data
        const downloadButton = document.createElement("button");
        downloadButton.innerHTML = "<b>Pobierz dane</b>";
        downloadButton.style.margin = "1rem";
        downloadButton.onclick = () => {
            controller.downloadData();
        }
        this.container.appendChild(downloadButton);

        const surveyLink = document.createElement("a");
        surveyLink.innerHTML = "<h3>Przejdź do ankiety</h3>";
        surveyLink.href = "TODO";   // TODO: add the link to the survey
        surveyLink.target = "_blank";
        // disable the link for now
        surveyLink.onclick = (e) => {
            e.preventDefault();
            // show a message that the survey is not ready yet
            alert("Ankieta nie jest jeszcze dostępna. Spróbuj ponownie później.");
        }
        this.container.appendChild(surveyLink);

        // Add a button to revoke localStorage consent if it was given
        if (controller.lsm.dataConsentGiven) {
            // add spacing
            const spacer = document.createElement("div");
            spacer.style.height = "5rem";
            this.container.appendChild(spacer);

            const revokeButton = document.createElement("button");
            revokeButton.innerHTML = "Usuń dane z pamięci przeglądarki";
            revokeButton.id = "deny";
            revokeButton.classList.add("tiny");
            revokeButton.onclick = () => {
                // add a confirmation dialog
                if (confirm("Czy na pewno chcesz usunąć swoje dane z pamięci przeglądarki? Po odświeżeniu strony aplikacja się zresetuje.")) {
                    controller.lsm.dataConsentGiven = false;
                    revokeButton.remove();
                }
            }
            this.container.appendChild(revokeButton);
        }
    }
}
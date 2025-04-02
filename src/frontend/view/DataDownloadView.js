import View from "./View.js";
import MoreInfo from "../components/MoreInfo.js";

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
        title.innerHTML = "I gotowe!";
        this.container.appendChild(title);

        // Add a paragraph
        const p = document.createElement("p");
        p.innerHTML = `Aby zakończyć swój udział w badaniu, pobierz swoje dane i załącz je w wiadomości do mnie poprzez Discord lub mailowo na adres <i>szymon.kus2.stud@pw.edu.pl</i>.`;
        p.style.textAlign = "center";
        this.container.appendChild(p);

        // Add a button to download the data
        const downloadButton = document.createElement("button");
        downloadButton.innerHTML = "<b>Pobierz dane</b>";
        downloadButton.style.margin = "1rem";
        downloadButton.onclick = () => {
            controller.downloadData();
        }
        this.container.appendChild(downloadButton);

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

        this.moreInfo = new MoreInfo(this.container);
    }
}
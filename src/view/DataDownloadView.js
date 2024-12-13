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
        downloadButton.innerHTML = "Pobierz dane";
        downloadButton.onclick = () => {
            controller.downloadData();
        }
        this.container.appendChild(downloadButton);
    }
}
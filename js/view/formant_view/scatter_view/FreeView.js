import { ScatterView } from "./ScatterView.js";

export class FreeView extends ScatterView {
    constructor(view) {
        super(view);

        this.h2.innerHTML = `Kalibracja ukończona!<br>
            Jesteś teraz w trybie swobodnego mówienia. 
            Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
        
        let button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.divStack.remove();
        }
        this.divStack.appendChild(button);
    }
}
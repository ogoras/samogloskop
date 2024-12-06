import SpeechView from "./SpeechView.js";

export default class CalibrationStartView extends SpeechView {
    div;
    divStack;

    constructor(controller, arg, recycle = false) {
        if (recycle) {
            const view = arg;
            super(controller, view);
            this.div = view.div;
            this.divStack = view.divStack;
            // clear div
            this.div.innerHTML = "";
            // append center div to div
            const centerDiv = document.createElement("div");
            centerDiv.classList.add("center");
            this.div.appendChild(centerDiv);
            centerDiv.appendChild(this.divStack);
        }
        else {
            const container = arg;
            super(controller);

            this.div = container;
            // find a .stack element in the container
            this.divStack = container.querySelector(".stack");
        }
        // create a h2 element
        this.divStack.innerHTML = `<h2 class="center">Witaj! Na początek, w celu kalibracji, włącz mikrofon i nagraj 10 sekund ciszy lub dźwięków z otoczenia.</h2>
          <p>Aplikacja może nie działać dobrze w miejscach, gdzie jest dużo hałasu.</p>`
    }
}
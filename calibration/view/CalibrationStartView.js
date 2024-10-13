import { FormantsView } from "./FormantsView.js";

export class CalibrationStartView extends FormantsView {
    constructor(container) {
        super();

        this.div = container;
        // find a .stack element in the container
        let stack = this.divStack =  container.querySelector(".stack");
        // create a h2 element
        stack.innerHTML = `<h2 class="center">Witaj! Na początek, w celu kalibracji, włącz mikrofon i nagraj 10 sekund ciszy lub dźwięków z otoczenia.</h2>
          <p>Aplikacja może nie działać dobrze w miejscach, gdzie jest dużo hałasu.</p>`
    }
}
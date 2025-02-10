import RecordingView from "./RecordingView.js";

export default class CalibrationStartView extends RecordingView {
    constructor(controller, recorder, prev) {
        super(controller, recorder, prev);

        this.stackComponent.innerHTML = `<h2 class="center">Witaj! Na początek, w celu kalibracji, włącz mikrofon i nagraj 10 sekund ciszy lub dźwięków z otoczenia.</h2>
        <p>Aplikacja może nie działać dobrze w miejscach, gdzie jest dużo hałasu.</p>`
    }
}
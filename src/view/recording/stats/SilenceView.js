import StatsView from "./StatsView.js";
import SilenceStackComponent from "../../components/stack/SilenceStackComponent.js";

export default class SilenceView extends StatsView {
    constructor(controller, recorder, prev) {
        super(controller, recorder, prev);
        
        this.stackComponent = new SilenceStackComponent(this.stackComponent, controller.calibrationTime);
        this.recordingStarted();
    }

    recordingStarted() {
        this.stackComponent.h2.innerHTML = "Nagrywanie ciszy, nie odzywaj się...";
    }

    recordingStopped() {
        this.stackComponent.h2.innerHTML = "Nagrywanie ciszy wstrzymane.";
    }
}
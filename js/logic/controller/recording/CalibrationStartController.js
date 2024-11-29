import RecordingController from "./RecordingController.js";
import nextController from "../nextController.js";

export default class CalibrationStartController extends RecordingController {
    init(prev) {
        super.init(prev);

        let interval = setInterval(() => {
            if (this.recorder.samplesCollected >= 8) {
                clearInterval(interval);
                this.continue();
            }
        }, 100);
    }

    continue() {
        this.sm.advance();
        nextController(this);
    }
}
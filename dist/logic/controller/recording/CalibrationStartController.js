import RecordingController from "./RecordingController.js";
import nextController from "../nextController.js";
export default class CalibrationStartController extends RecordingController {
    #newIntensityStats = false;
    init(prev) {
        super.init(prev);
        const interval = setInterval(() => {
            if (this.recorder.samplesCollected >= 8) {
                clearInterval(interval);
                this.continue();
            }
        }, 100);
    }
    continue() {
        this.sm.advance();
        nextController(this, this.#newIntensityStats);
        if (this.#newIntensityStats) {
            this.#newIntensityStats = false;
        }
    }
    newIntensityStats() {
        this.#newIntensityStats = true;
    }
}

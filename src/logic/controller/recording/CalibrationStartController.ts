import RecordingController from "./RecordingController.js";
import nextController from "../nextController.js";
import Controller from "../Controller.js";

export default class CalibrationStartController extends RecordingController {
    #newIntensityStats = false;

    override init(prev: Controller) {
        super.init(prev);
        super.validate();
        const interval = setInterval(() => {
            if (this.recorder!.samplesCollected >= 8) {
                clearInterval(interval);
                this.continue();
            }
        }, 100);
    }

    continue() {
        this.validate();
        this.sm!.advance();
        nextController(this, this.#newIntensityStats);
        if (this.#newIntensityStats) {
            this.#newIntensityStats = false;
        }
    }

    newIntensityStats() {
        this.#newIntensityStats = true;
    }
}
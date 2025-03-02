import RecordingController from "./RecordingController.js";
import nextController from "../nextController.js";
import Controller from "../Controller.js";
import CalibrationStartView from "../../../frontend/view/recording/CalibrationStartView.js";

export default class CalibrationStartController extends RecordingController {
    #newIntensityStats = false;

    override init(prev: Controller) {
        super.init(prev);
        
        this.view?.destroy?.();
        this.view = new CalibrationStartView(this, this.recorder);

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
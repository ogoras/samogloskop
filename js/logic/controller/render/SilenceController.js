import nextController from "../nextController.js";
import RenderController from "./RenderController.js";

export default class SilenceController extends RenderController {
    renderLoop() {
        if (super.renderLoop()) return true;

        const samples = this.samples;
        const stats = this.intensityStats;

        if (this.statsUpdated) {
            this.formantsBuffer.clear();
            this.samplesBuffer.clear();
        }

        this.view.feed(samples);
        this.view.intensityStats = stats;
        this.view.progressTime = this.time;

        if (stats.isCalibrationFinished(this.time)) {
            stats.saveStats("silence");
            this.sm.advance();
            nextController(this);
            return true;
        }

        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }
}
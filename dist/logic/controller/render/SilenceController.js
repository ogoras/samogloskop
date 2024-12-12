import nextController from "../nextController.js";
import RenderController from "./RenderController.js";
export default class SilenceController extends RenderController {
    renderLoop() {
        if (super.renderLoop())
            return true;
        const stats = this.intensityStats;
        const view = this.view;
        if (this.statsUpdated) {
            this.formantsBuffer.clear();
            this.samplesBuffer.clear();
        }
        view.intensityStats = stats;
        view.progressTime = this.time;
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

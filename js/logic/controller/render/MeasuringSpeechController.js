import nextController from "../nextController.js";
import RenderController from "./RenderController.js";

export default class MeasuringSpeechController extends RenderController {
    renderLoop() {
        if (super.renderLoop()) return true;

        const samples = this.samples;
        const stats = this.intensityStats;
        const view = this.view;

        if (this.statsUpdated) {
            this.formantsBuffer.clear();
            this.samplesBuffer.clear();
        }

        view.feed(samples);

        switch(this.sm.state.name) {
            case "WAITING_FOR_SPEECH":
                if (stats.detectSpeech()) {
                    this.sm.advance();
                    view.startTime = this.time;
                    view.updateView();
                }
                break;
            case "MEASURING_SPEECH":
                view.intensityStats = stats;
                view.progressTime = this.time;

                if (stats.isCalibrationFinished(this.time)) {
                    stats.saveStats("speech");
                    const poppedState = this.sm.advance();
                    this.lsm.intensityStats = stats;
                    stats.resetStart();
                    if (poppedState) {
                        nextController(this);
                        return false;
                    }
                    view.updateView();
                }
                break;
            case "SPEECH_MEASURED":
                // wait for 2 seconds of silence
                const silenceRequired = 2;
                const duration = stats.silenceDuration;
                const progress = duration / silenceRequired;
                if (duration >= silenceRequired) {
                    view.progress = 1;
                    this.sm.advance();
                    nextController(this);
                    return false;
                }
                view.progress = progress;
                break;
            default:
                throw new Error(`Invalid state in ${this.constructor.name}: ${this.sm.state.name}`);
        }

        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }
}
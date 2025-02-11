import nextController from "../nextController.js";
import RenderController from "./RenderController.js";
import MeasuringSpeechView from "../../../view/recording/stats/MeasuringSpeechView.js";

export default class MeasuringSpeechController extends RenderController {
    initView(prev) {
        this.view = new MeasuringSpeechView(this, this.recorder, prev?.view);
    }

    renderLoop() {
        if (super.renderLoop()) return true;

        const stats = this.intensityStats;
        const view = this.view;

        if (this.statsUpdated) {
            this.formantsBuffer.clear();
            this.samplesBuffer.clear();
        }

        switch(this.sm.state.name) {
            case "WAITING_FOR_SPEECH":
                if (stats.detectSpeech()) {
                    this.sm.advance();
                    view.startTime = this.time;
                    view.speechDetected = true;
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
                    view.finish();
                }
                break;
            case "SPEECH_MEASURED":
                // wait for 2 seconds of silence
                if (this.waitFor(2)) {
                    this.sm.advance();
                    nextController(this);
                    return false;
                }
                break;
            default:
                throw new Error(`Invalid state in ${this.constructor.name}: ${this.sm.state.name}`);
        }

        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }
}
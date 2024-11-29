import nextController from "../../nextController.js";
import soundToFormant from "../../../praat/formant.js";
import RenderController from "./RenderController.js";

export default class SilenceController extends RenderController {
    renderLoop() {
        super.renderLoop();

        const recorder = this.recorder;
        const sampleRate = recorder.sampleRate;
        const samplesBuffer = this.samplesBuffer;
        const formantsBuffer = this.formantsBuffer;
        const stats = this.intensityStats;

        if (recorder.samplesCollected < 8) {
            requestAnimationFrame(this.renderLoop.bind(this));
            return;
        }

        const samples = recorder.dump();
        samplesBuffer.pushMultiple(samples);
        formantsBuffer.pushMultiple(
            soundToFormant(samplesBuffer.getCopy(), sampleRate, this.lsm.preset.frequency)
            .map((formants) => formants.intensity));
        this.time += samples.length / sampleRate;

        if (stats.update(this.time, formantsBuffer.buffer, samplesBuffer.buffer)) {
            formantsBuffer.clear();
            samplesBuffer.clear();
        }

        this.view.feed(samples, {intensityStats: stats, progressTime: this.time})

        if (stats.isCalibrationFinished(this.time)) {
            stats.saveStats("silence");
            this.sm.advance();
            nextController(this);
            return;
        }

        requestAnimationFrame(this.renderLoop.bind(this));
    }
}
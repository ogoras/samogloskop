import Controller from "./Controller.js";
import Buffer from "../util/Buffer.js";
import nextController from "./nextController.js";
import soundToFormant from "../praat/formant.js";
import IntensityStats from "../../data/IntensityStats.js";
import SettingsController from "./SettingsController.js";

export const formantCount = 20;
const calibrationTime = 10;
const statsStep = 0.1;    // 100 ms
export default class SilenceController extends Controller {
    get calibrationTime() {
        return calibrationTime;
    }
    formantsBuffer = new Buffer(formantCount);
    time = 0;
    intensityStats = new IntensityStats(calibrationTime, statsStep);

    init(prev) {
        this.sm = prev.sm;
        this.lsm = prev.lsm;
        let recorder = this.recorder = prev.recorder;

        const sampleRate = recorder.sampleRate;
        this.samplesBuffer = new Buffer(sampleRate / 20);

        recorder.onStart = () => {
            this.samplesBuffer.clear();
            this.formantsBuffer.clear();
        };

        this.view = prev.view;
        this.settingsController = SettingsController.getInstance();
        this.settingsController.init(this);
        this.view.controller = this;
        this.view.updateView();

        this.renderLoop();
    }

    renderLoop() {
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
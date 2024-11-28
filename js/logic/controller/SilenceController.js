import Controller from "./Controller.js";
import Buffer from "../util/Buffer.js";
import nextController from "./nextController.js";
import soundToFormant from "../praat/formant.js";
import IntensityStats from "../../data/IntensityStats.js";

const formantCount = 20;
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
        this.settingsController = prev.settingsController;
        this.view.controller = this;
        this.view.updateView();

        this.renderLoop();
    }

    renderLoop() {
        const recorder = this.recorder;
        if (recorder.samplesCollected < 8) {
            requestAnimationFrame(this.renderLoop.bind(this));
            return;
        }

        const samples = recorder.dump();

        const samplesBuffer = this.samplesBuffer;
        samplesBuffer.pushMultiple(samples);
        const sampleRate = recorder.sampleRate;
        const formantsBuffer = this.formantsBuffer;
        formantsBuffer.pushMultiple( 
            soundToFormant(samplesBuffer.getCopy(), sampleRate, this.lsm.preset.frequency)
            .map((formants) => formants.intensity));
        this.time += samples.length / sampleRate;
        
        const stats = this.intensityStats;
        if (stats.update(this.time, formantsBuffer.buffer, samplesBuffer.buffer)) {
            formantsBuffer.clear();
        }

        if (stats.isCalibrationFinished(this.time)) {
            stats.saveStats("silence");
            this.sm.advance();
            nextController(this);
        }

        this.view.feed(samples, {intensityStats: stats, progressTime: this.time})

        requestAnimationFrame(this.renderLoop.bind(this));
    }
}
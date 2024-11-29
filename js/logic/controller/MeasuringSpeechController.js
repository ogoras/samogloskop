import Controller from "./Controller.js";
import soundToFormant from "../praat/formant.js";
import nextController from "./nextController.js";
import RecordingView from "../../view/RecordingView.js";
import SettingsController from "./SettingsController.js";
import AudioRecorder from "../recording/Recorder.js";
import Buffer from "../util/Buffer.js";
import { formantCount } from "./SilenceController.js";

export default class MeasuringSpeechController extends Controller {
    #breakRenderLoop = false;

    init(prev) {
        this.sm = prev.sm;
        this.lsm = prev.lsm;

        this.recorder = prev.recorder ?? new AudioRecorder();

        this.samplesBuffer = prev.samplesBuffer ?? new Buffer(this.recorder.sampleRate / 20);
        this.formantsBuffer = prev.formantsBuffer ?? new Buffer(formantCount);
        this.time = prev.time ?? 0;
        this.intensityStats = prev.intensityStats ?? this.lsm.intensityStats;

        this.settingsController = SettingsController.getInstance();
        this.settingsController.init(this);

        if (prev.view) {
            this.view = prev.view;
            this.view.controller = this;
            this.view.updateView();
        }
        else this.view = new RecordingView(this, this.recorder);

        this.renderLoop();
    }

    renderLoop() {
        if (this.#breakRenderLoop) {
            this.#breakRenderLoop = false;
            return;
        }

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

        switch(this.sm.state.name) {
            case "WAITING_FOR_SPEECH":
                if (stats.detectSpeech()) {
                    this.sm.advance();
                    this.view.feed(samples, {startTime: this.time})
                    this.view.updateView();
                }
                break;
            case "MEASURING_SPEECH":
                this.view.feed(samples, {intensityStats: stats, progressTime: this.time})

                if (stats.isCalibrationFinished(this.time)) {
                    stats.saveStats("speech");
                    const poppedState = this.sm.advance();
                    this.lsm.intensityStats = stats;
                    stats.resetStart();
                    if (poppedState) {
                        nextController(this);
                        return;
                    }
                    this.view.updateView();
                }
                break;
            case "SPEECH_MEASURED":
                // wait for 2 seconds of silence
                const silenceRequired = 2;
                const duration = stats.silenceDuration;
                const progress = duration / silenceRequired;
                if (duration >= silenceRequired) {
                    this.view.feed(samples, {progress : 1})
                    this.sm.advance();
                    nextController(this);
                    return;
                }
                this.view.feed(samples, {progress})
                break;
            default:
                throw new Error(`Invalid state in ${this.constructor.name}: ${this.sm.state.name}`);
        }

        requestAnimationFrame(this.renderLoop.bind(this));
    }

    pauseRendering() {
        this.#breakRenderLoop = true;
    }

    resumeRendering() {
        this.renderLoop();
    }
}
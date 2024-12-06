import RecordingController from "../recording/RecordingController.js";
import Buffer from "../../util/Buffer.js";
import IntensityStats from "../../../model/IntensityStats.js";
import State from "../../../const/states.js";
import nextController from "../nextController.js";
import soundToFormant from "../../praat/formant.js";

const formantCount = 20;
const calibrationTime = 10;
const statsStep = 0.1;    // 100 ms
export default class RenderController extends RecordingController {
    get calibrationTime() {
        return calibrationTime;
    }

    #breakRenderLoop = false;

    get formantCount() {
        return formantCount;
    }

    constructor() {
        super();
        if (this.constructor === RenderController) {
            throw new TypeError(`Abstract class "${this.constructor.name}" cannot be instantiated directly.`);
        }
    }
    
    init(prev, newIntensityStats = false) {
        this.initStart(prev, newIntensityStats);
        this.initFinalAndRun(prev);
    }

    initStart(prev, newIntensityStats = false) {
        this.initRecorder(prev);

        this.recorder.onStart = () => {
            this.samplesBuffer.clear();
            this.formantsBuffer.clear();
        };

        this.formantsBuffer = prev.formantsBuffer ?? new Buffer(formantCount);
        this.samplesBuffer = prev.samplesBuffer ?? new Buffer(this.recorder.sampleRate / 20);
        this.time = prev.time ?? 0;

        this.intensityStats = prev.intensityStats ?? this.lsm.intensityStats ?? new IntensityStats(calibrationTime, statsStep);
        if (newIntensityStats) this.intensityStats = new IntensityStats(calibrationTime, statsStep);
    }

    initFinalAndRun(prev) {
        this.initSettingsAndView(prev);
        this.renderLoop();
    }

    breakRenderLoop() {
        this.#breakRenderLoop = true;
    }

    renderLoop() {  // true if returning early
        if (this.#breakRenderLoop) {
            this.#breakRenderLoop = false;
            return true;
        }

        const recorder = this.recorder;
        const sampleRate = recorder.sampleRate;
        const samplesBuffer = this.samplesBuffer;
        const formantsBuffer = this.formantsBuffer;
        const stats = this.intensityStats;

        if (recorder.samplesCollected < 8) {
            requestAnimationFrame(this.renderLoop.bind(this));
            return true;
        }
    
        const samples = recorder.dump();
        samplesBuffer.pushMultiple(samples);
        const formants = this.formants = soundToFormant(samples, sampleRate, this.lsm.preset.frequency);
        formantsBuffer.pushMultiple(
            formants.map((formants) => {
                return {
                F1: formants.formant.length >= 1 ? formants.formant[0].frequency : null,
                F2: formants.formant.length >= 2 ? formants.formant[1].frequency : null,
                length: formants.formant.length,
                endTime: this.time,
                intensity: formants.intensity
            };}));
        this.time += samples.length / sampleRate;

        this.statsUpdated = stats.update(this.time, formantsBuffer.buffer.map((formants) => formants.intensity), samplesBuffer.buffer);

        this.view.feed(samples);

        return false;
    }

    pauseRendering() {
        this.breakRenderLoop();
    }

    resumeRendering() {
        this.renderLoop();
    }

    recalibrate() {
        this.enableMic?.();

        delete this.intensityStats;
        this.sm.state = State.get("NO_SAMPLES_YET");
        nextController(this).newIntensityStats();
        this.breakRenderLoop();
    }

    waitFor(silenceRequired) {
        if (this.statsUpdated) {
            const duration = this.intensityStats.silenceDuration;
            if (duration >= silenceRequired) {
                this.view.progress = 1;
                return true;
            }
            this.view.progress = duration / silenceRequired;
        }
        return false;
    }
}
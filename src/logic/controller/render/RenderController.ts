import RecordingController from "../recording/RecordingController.js";
import Buffer from "../../util/Buffer.js";
import IntensityStats from "../../../model/IntensityStats.js";
import State from "../../../const/enum/State.js";
import nextController from "../nextController.js";
import soundToFormant from "../../praat/formant.js";
import Controller from "../Controller.js";

type formantsEntry = {
    F1: number | null,
    F2: number | null,
    length: number,
    endTime: number,
    intensity: number;
}

const formantCount = 20;
const calibrationTime = 10;
const statsStep = 0.1;    // 100 ms
export default class RenderController extends RecordingController {
    speechDetected = false;

    intensityStats?: IntensityStats;

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
    
    override init(prev: Controller, newIntensityStats = false) {
        if (this.initStart(prev, newIntensityStats)) return;
        this.initFinalAndRun(prev);
    }

    override initStart(prev: Controller, newIntensityStats = false) {
        this.#breakRenderLoop = false;

        if (super.initStart(prev)) return true;

        super.validate();
        this.recorder!.onStart = () => {
            this.samplesBuffer.clear();
            this.formantsBuffer.clear();
        };

        this.formantsBuffer = prev.formantsBuffer ?? new Buffer(formantCount);
        this.samplesBuffer = prev.samplesBuffer ?? new Buffer(this.recorder!.sampleRate / 20);
        this.time = prev.time ?? 0;

        this.intensityStats = prev.intensityStats ?? this.lsm!.intensityStats ?? new IntensityStats(calibrationTime, statsStep);
        if (newIntensityStats) this.intensityStats = new IntensityStats(calibrationTime, statsStep);

        return false;
    }

    initFinalAndRun(prev: Controller) {
        this.initSettings(prev);
        this.validate();
        this.initView(prev);
        this.initTimer(prev);
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
        this.validate();

        const recorder = this.recorder;
        const sampleRate = recorder!.sampleRate;
        const samplesBuffer = this.samplesBuffer;
        const formantsBuffer = this.formantsBuffer;
        const stats = this.intensityStats!;

        if (recorder!.samplesCollected < 8) {
            requestAnimationFrame(this.renderLoop.bind(this));
            return true;
        }

        const samples = recorder!.dump();
        this.samplesThisFrame = [...samples];
        samplesBuffer.pushMultiple(samples);
        const formants = this.formants = soundToFormant(samples, sampleRate, this.lsm!.preset.frequency);
        formantsBuffer.pushMultiple(
            formants.map((formants) => {
                return {
                F1: formants.formant.length >= 1 ? formants.formant[0]?.frequency : null,
                F2: formants.formant.length >= 2 ? formants.formant[1]?.frequency : null,
                length: formants.formant.length,
                endTime: this.time,
                intensity: formants.intensity
            };}));
        this.time += samples.length / sampleRate;

        this.statsUpdated = stats.update(this.time, formantsBuffer.buffer.map((formants: formantsEntry) => formants.intensity), samplesBuffer.buffer);

        this.view.feed?.(samples);

        return false;
    }

    pauseRendering() {
        this.breakRenderLoop();
    }

    resumeRendering() {
        this.renderLoop();
    }

    recalibrate() {
        this.validate();

        this.enableMic?.();

        delete this.intensityStats;
        this.sm!.state = State.get("NO_SAMPLES_YET");
        nextController(this).newIntensityStats();
        this.breakRenderLoop();
    }

    waitFor(silenceRequired: number) {
        this.validate();

        if (this.statsUpdated) {
            const duration = this.intensityStats!.silenceDuration;
            if (duration >= silenceRequired) {
                this.view.progress = 1;
                return true;
            }
            this.view.progress = duration / silenceRequired;
        }
        return false;
    }

    override validate() {
        super.validate();
        if (!this.intensityStats) throw new Error("IntensityStats not initialized");
        if (!this.initView) throw new Error(`initView function not defined in ${this.constructor.name}`);
    }
}
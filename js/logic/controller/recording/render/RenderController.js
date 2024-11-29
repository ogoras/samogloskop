import RecordingController from "../RecordingController.js";
import Buffer from "../../../util/Buffer.js";
import IntensityStats from "../../../../data/IntensityStats.js";

const formantCount = 20;
const calibrationTime = 10;
const statsStep = 0.1;    // 100 ms
export default class RenderController extends RecordingController {
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
    
    init(prev) {
        this.initStart(prev);
        this.initFinalAndRun(prev);
    }

    initStart(prev) {
        this.initRecorder(prev);

        this.recorder.onStart = () => {
            this.samplesBuffer.clear();
            this.formantsBuffer.clear();
        };

        this.formantsBuffer = prev.formantsBuffer ?? new Buffer(formantCount);
        this.samplesBuffer = prev.samplesBuffer ?? new Buffer(this.recorder.sampleRate / 20);
        this.time = prev.time ?? 0;

        this.intensityStats = prev.intensityStats ?? this.lsm.intensityStats ?? new IntensityStats(calibrationTime, statsStep);
    }

    initFinalAndRun(prev) {
        this.initSettingsAndView(prev);
        this.renderLoop();
    }

    newIntensityStats() {
        this.intensityStats = new IntensityStats(calibrationTime, statsStep);
    }

    breakRenderLoop() {
        this.#breakRenderLoop = true;
    }

    renderLoop() {
        if (this.#breakRenderLoop) {
            this.#breakRenderLoop = false;
            return;
        }
    }

    pauseRendering() {
        this.breakRenderLoop();
    }

    resumeRendering() {
        this.renderLoop();
    }
}
import Controller from "./Controller.js";
import SettingsController from "./SettingsController.js";
import nextController from "./nextController.js";
import Buffer from "../util/Buffer.js";
import { formantCount } from "./SilenceController.js";
import soundToFormant from "../praat/formant.js";
import AudioRecorder from "../recording/Recorder.js";
import { minimumSmoothingCount } from "./GatheringVowelsController.js";
import RecordingView from "../../view/RecordingView.js";
import { POINT_SIZES } from "../../const/POINT_SIZES.js";
import State from "../../const/states.js";

export default class ConfirmVowelsController extends Controller {
    #breakRenderLoop = false;

    get formantCount() {
        return formantCount;
    }

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

        this.userVowels = prev.userVowels ?? this.lsm.userVowels;
        this.smoothedFormantsBuffer = prev.smoothedFormantsBuffer ?? new Buffer(minimumSmoothingCount);

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
        const userVowels = this.userVowels;

        if (recorder.samplesCollected < 8) {
            requestAnimationFrame(this.renderLoop.bind(this));
            return;
        }
    
        const samples = recorder.dump();
        samplesBuffer.pushMultiple(samples);
        const formants = soundToFormant(samples, sampleRate, this.lsm.preset.frequency);
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

        stats.update(this.time, formantsBuffer.buffer.map((formants) => formants.intensity), samplesBuffer.buffer);        

        if (!stats.detectSpeech()) {
            this.formantsBuffer.clear();
            this.smoothedFormantsBuffer.clear();
            this.view.feed(samples);
        }
        else {
            const formantPoints = formants
                .filter((formants) => formants.formant.length >= 2)
                .map((formants) => {
                    let point = {x: formants.formant[1].frequency, y: formants.formant[0].frequency};
                    userVowels.scale(point);
                    return point;
                });
            const formantsSmoothed = userVowels.scale(this.getSmoothedFormants());
            this.view.feed(samples, {formantsSmoothed, formants: formantPoints});
        }

        requestAnimationFrame(this.renderLoop.bind(this));
    }

    getSmoothedFormants() {
        const formantsBuffer = this.formantsBuffer;
        const smoothedFormantsBuffer = this.smoothedFormantsBuffer;
        if (formantsBuffer.length < minimumSmoothingCount) return undefined;
        const ratio = 0.5;
        let weightSum = 0;
        let xSum = 0;
        let ySum = 0;
        let weight = 1;
        for (let formants of formantsBuffer.buffer) {
            xSum += formants.F2 * weight;
            ySum += formants.F1 * weight;
            weightSum += weight;
            weight *= ratio;
        }
        let smoothedFormants = {
            x: xSum / weightSum,
            y: ySum / weightSum,
            size: POINT_SIZES.CURRENT,
            //color: !userVowels.isDone() ? userVowels.currentVowel.rgb : "black"
        };
        smoothedFormantsBuffer.push(smoothedFormants)
        return smoothedFormants;
    }

    editVowel(vowel) {
        this.userVowels.resetVowel(vowel);
        this.sm.state = State.get("GATHERING_NATIVE");
        nextController(this);
        this.#breakRenderLoop = true;
    }

    confirm() {
        this.sm.advance();
        nextController(this);
        this.#breakRenderLoop = true;
    }

    recalibrate() {
        delete this.intensityStats;
        this.sm.state = State.get("NO_SAMPLES_YET");
        nextController(this);
        this.#breakRenderLoop = true;
    }

    pauseRendering() {
        this.#breakRenderLoop = true;
    }

    resumeRendering() {
        this.renderLoop();
    }
}
import nextController from "../../nextController.js";
import Buffer from "../../../util/Buffer.js";
import soundToFormant from "../../../praat/formant.js";
import { minimumSmoothingCount } from "./GatheringVowelsController.js";
import { POINT_SIZES } from "../../../../const/POINT_SIZES.js";
import State from "../../../../const/states.js";
import RenderController from "./RenderController.js";

export default class ConfirmVowelsController extends RenderController {
    init(prev) {
        this.smoothedFormantsBuffer = prev.smoothedFormantsBuffer ?? new Buffer(minimumSmoothingCount);

        this.initStart(prev);
        this.userVowels = prev.userVowels ?? this.lsm.userVowels;
        this.initFinalAndRun(prev);
    }

    renderLoop() {
        super.renderLoop();
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
        this.breakRenderLoop();
    }

    confirm() {
        this.sm.advance();
        nextController(this);
        this.breakRenderLoop();
    }

    recalibrate() {
        delete this.intensityStats;
        this.sm.state = State.get("NO_SAMPLES_YET");
        nextController(this).newIntensityStats();
        this.breakRenderLoop();
    }
}
import nextController from "../nextController.js";
import { POINT_SIZES } from "../../../const/POINT_SIZES.js";
import State from "../../../const/states.js";
import SmoothingController from "./SmoothingController.js";

export default class ConfirmVowelsController extends SmoothingController {
    renderLoop() {
        if (super.renderLoop()) return true;
        
        const samples = this.samples;
        const formants = this.formants;
        const stats = this.intensityStats;
        const userVowels = this.userVowels;      

        this.view.feed(samples);

        if (!stats.detectSpeech()) {
            this.formantsBuffer.clear();
            this.smoothedFormantsBuffer.clear();
        }
        else {
            const formantPoints = formants
                .filter((formants) => formants.formant.length >= 2)
                .map((formants) => {
                    const point = {x: formants.formant[1].frequency, y: formants.formant[0].frequency};
                    userVowels.scale(point);
                    return point;
                });
            const formantsSmoothed = userVowels.scale(this.getSmoothedFormants());
            this.view.feedSmoothed(formantsSmoothed, false);
            this.view.feedFormants(formantPoints, false);
        }

        requestAnimationFrame(this.renderLoop.bind(this));
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
}
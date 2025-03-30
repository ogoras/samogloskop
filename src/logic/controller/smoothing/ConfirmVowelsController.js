import nextController from "../nextController.js";
import State from "../../../const/enum/State.js";
import SmoothingController from "./SmoothingController.js";
import ConfirmVowelsView from "../../../frontend/view/recording/confirm/ConfirmVowelsView.js";

export default class ConfirmVowelsController extends SmoothingController {
    initView(prev) {
        this.view = new ConfirmVowelsView(this, this.recorder, prev?.view);
    }

    renderLoop() {
        if (super.renderLoop()) return true;
        this.processFormants(false);
        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }

    editVowel(vowel) {
        this.nativeVowels.resetVowel(vowel);
        this.stopCountingTime();
        this.sm.state = State.get("GATHERING_NATIVE");
        nextController(this);
        this.breakRenderLoop();
    }

    confirm() {
        this.stopCountingTime();
        this.sm.advance();
        nextController(this);
        this.breakRenderLoop();
    }
}
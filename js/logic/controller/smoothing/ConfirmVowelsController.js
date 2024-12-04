import nextController from "../nextController.js";
import { POINT_SIZES } from "../../../const/POINT_SIZES.js";
import State from "../../../const/states.js";
import SmoothingController from "./SmoothingController.js";

export default class ConfirmVowelsController extends SmoothingController {
    renderLoop() {
        if (super.renderLoop()) return true;

        this.processFormants(false);

        requestAnimationFrame(this.renderLoop.bind(this));
    }

    editVowel(vowel) {
        this.nativeVowels.resetVowel(vowel);
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
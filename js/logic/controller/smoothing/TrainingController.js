import SmoothingController from "./SmoothingController.js";

export default class TrainingController extends SmoothingController {
    renderLoop() {
        if (super.renderLoop()) return true;
        this.processFormants(false);
        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }
}
import Vowels from "../../../model/vowels/Vowels.js";
import SmoothingController from "./SmoothingController.js";

export default class TrainingController extends SmoothingController {
    async init(prev) {
        super.init(prev);

        this.petersonBarney = await Vowels.create("EN", "peterson_barney");
        this.view.addDataset(this.petersonBarney);
    }

    renderLoop() {
        if (super.renderLoop()) return true;
        this.processFormants(false);
        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }
}
import Vowels from "../../../model/vowels/Vowels.js";
import SmoothingController from "./SmoothingController.js";
import ForeignRecordings from "../../../model/recordings/ForeignRecordings.js";
import nextController from "../nextController.js";
export default class TrainingController extends SmoothingController {
    #discarded = false;
    async init(prev) {
        if (this.#discarded)
            return;
        super.init(prev);
        this.petersonBarney = await Vowels.create("EN", "peterson_barney");
        this.englishRecordings = prev.foreignRecordings ?? await ForeignRecordings.create("EN");
        this.view.addDatasets(this.petersonBarney, this.englishRecordings.combinedVowels);
    }
    renderLoop() {
        if (super.renderLoop() || this.#discarded)
            return true;
        this.processFormants(false);
        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }
    next() {
        if (this.#discarded)
            return;
        this.sm.advance();
        this.breakRenderLoop();
        nextController(this);
        this.#discarded = true;
    }
}

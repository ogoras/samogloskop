import Vowels from "../../../model/vowels/Vowels.js";
import SmoothingController from "./SmoothingController.js";
import ForeignRecordings from "../../../model/recordings/ForeignRecordings.js";
export default class TrainingController extends SmoothingController {
    async init(prev) {
        super.init(prev);
        this.petersonBarney = await Vowels.create("EN", "peterson_barney");
        this.englishRecordings = prev.foreignRecordings ?? await ForeignRecordings.create("EN");
        this.view.addDatasets(this.petersonBarney, this.englishRecordings.combinedVowels);
    }
    renderLoop() {
        if (super.renderLoop())
            return true;
        this.processFormants(false);
        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }
}

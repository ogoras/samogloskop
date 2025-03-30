import Preset from "../../const/enum/Preset.js";
import Controller from "./Controller.js";

export default class SettingsController extends Controller {
    override init(parent: Controller) {
        this.parent = parent;
        super.init(parent);
        this.intensityStats = parent.intensityStats;
    }

    choose(preset: Preset) {
        this.validate();
        this.lsm!.preset = preset;
    }

    recalibrate() {
        this.parent.recalibrate();
    }

    retest() {
        if (!this.lsm!.state.is("TRAINING")) throw new Error("Cannot retest outside of training state");
        if (!this.parent.retest) throw new Error("Could not find retest function in parent controller");

        this.parent.stopCountingTime();
        this.parent.retest();
    }

    load() {
        this.parent?.stopCountingTime?.();
        this.lsm!.loadFromFile();
    }

    save() {
        this.lsm!.saveToFile(`samogloskop_zapis_${new Date().toISOString()}.json`);
    }
}
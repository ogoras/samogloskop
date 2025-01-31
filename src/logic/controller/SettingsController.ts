import Preset from "../../const/Preset.js";
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
}
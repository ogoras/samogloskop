import Controller from "./Controller.js";
export default class SettingsController extends Controller {
    init(parent) {
        this.parent = parent;
        super.init(parent);
        this.intensityStats = parent.intensityStats;
    }
    choose(preset) {
        this.lsm.preset = preset;
    }
    recalibrate() {
        this.parent.recalibrate();
    }
}

import Controller from "./Controller.js";

export default class SettingsController extends Controller {
    init(parent) {
        this.parent = parent;
        this.sm = parent.sm;
        this.lsm = parent.lsm;
        this.intensityStats = parent.intensityStats;
    }

    choose(preset) {
        this.lsm.preset = preset;
    }

    recalibrate() {
        this.parent.recalibrate();
    }
}
import Controller from "./Controller.js";

export default class SettingsController extends Controller {
    init({sm, lsm}) {
        this.sm = sm;
        this.lsm = lsm;
    }

    choose(preset) {
        this.lsm.preset = preset;
    }
}
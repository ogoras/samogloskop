import Controller from "./Controller.js";

export default class SilenceController extends Controller {
    init(prev) {
        this.sm = prev.sm;
        this.lsm = prev.lsm;
        this.recorder = prev.recorder;
        this.view = prev.view;
        this.settingsController = prev.settingsController;
        this.view.controller = this;
        this.view.updateView();
    }
}
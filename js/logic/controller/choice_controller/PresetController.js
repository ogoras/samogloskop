import Controller from "../Controller.js";
import PresetView from "../../../view/PresetView.js";
import nextController from "../nextController.js";

export default class PresetController extends Controller {
    init({sm, lsm}) {
        this.sm = sm;
        this.lsm = lsm;

        this.view = new PresetView(this);
    }

    choose(preset) {
        this.lsm.preset = preset;
        this.sm.advance();

        nextController(this);
    }
}
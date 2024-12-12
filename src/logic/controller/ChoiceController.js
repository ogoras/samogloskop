import Controller from "./Controller.js";
import ConsentView from "../../view/choice/ConsentView.js";
import PresetView from "../../view/choice/PresetView.js";
import nextController from "./nextController.js";

const VIEW_CONSTRUCTORS = {
    "DATA_CONSENT": ConsentView,
    "PRESET_SELECTION": PresetView
}

const PROPERTY_NAMES = {
    "DATA_CONSENT": "dataConsentGiven",
    "PRESET_SELECTION": "preset"
}

export default class ChoiceController extends Controller {
    init(prev) {
        super.init(prev);
        this.view = new VIEW_CONSTRUCTORS[this.stateName](this);
    }

    choose(value) {
        this.lsm[PROPERTY_NAMES[this.stateName]] = value;
        this.sm.advance();

        if (this.state.after("PRESET_SELECTION")) {
            nextController(this);
        }
        else {
            this.view = new VIEW_CONSTRUCTORS[this.stateName](this);
        }
    }
}
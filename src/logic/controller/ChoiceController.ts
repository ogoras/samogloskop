import Controller from "./Controller.js";
import ConsentView from "../../view/choice/ConsentView.js";
import PresetView from "../../view/choice/PresetView.js";
import View from "../../view/View.js";
import nextController from "./nextController.js";

const VIEW_CONSTRUCTORS: {
    [key: string]: typeof View
} = {
    "DATA_CONSENT": ConsentView,
    "PRESET_SELECTION": PresetView
}

const PROPERTY_NAMES: {
    [key: string]: string
} = {
    "DATA_CONSENT": "dataConsentGiven",
    "PRESET_SELECTION": "preset"
}

export default class ChoiceController extends Controller {
    view?: View;

    override init(prev: Controller) {
        super.init(prev);
        this.#constructNewView();
    }

    choose(value: string | boolean | undefined) {
        this.validate();

        const propertyName = PROPERTY_NAMES[this.stateName!];
        if (!propertyName) throw new Error(`No property name found for state ${this.stateName}`);
        this.lsm![propertyName] = value;
        this.sm!.advance();

        if (this.state!.after("PRESET_SELECTION")) {
            nextController(this);
        }
        else {
            this.#constructNewView();
        }
    }

    #constructNewView() {
        const Constructor = VIEW_CONSTRUCTORS[this.stateName!];
        if (!Constructor) throw new Error(`No view constructor found for state ${this.stateName}`);
        this.view = new Constructor(this);
    }
}
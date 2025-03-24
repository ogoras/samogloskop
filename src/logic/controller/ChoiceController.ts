import Controller from "./Controller.js";
import ChoiceView from "../../frontend/view/choice/ChoiceView.js";
import ConsentView from "../../frontend/view/choice/ConsentView.js";
import View from "../../frontend/view/View.js";
import nextController from "./nextController.js";

const CHOICE_VIEWS: {
    [key: string]: typeof ChoiceView
} = {
    "DATA_CONSENT": ConsentView,
    "PRESET_SELECTION": ChoiceView
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
        this.view?.destroy?.();
        const Constructor = CHOICE_VIEWS[this.stateName!];
        if (!Constructor) throw new Error(`No view constructor found for state ${this.stateName}`);

        this.view = new Constructor(this);
    }
}
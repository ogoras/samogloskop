import Controller from "./Controller.js";
import ChoiceView from "../../frontend/view/ChoiceView.js";
import ConsentCompoment from "../../frontend/components/choice/ConsentComponent.js";
import PresetComponent from "../../frontend/components/choice/PresetComponent.js";
import View from "../../frontend/view/View.js";
import nextController from "./nextController.js";
import type ChoiceComponent from "../../frontend/components/choice/ChoiceComponent.js";

const CHOICE_COMPONENTS: {
    [key: string]: typeof ChoiceComponent
} = {
    "DATA_CONSENT": ConsentCompoment,
    "PRESET_SELECTION": PresetComponent
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
        const Constructor = CHOICE_COMPONENTS[this.stateName!];
        if (!Constructor) throw new Error(`No view constructor found for state ${this.stateName}`);
        this.view = new ChoiceView(this, Constructor);
    }
}
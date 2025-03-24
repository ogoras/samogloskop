import ChoiceView from "./ChoiceView.js";
import ConsentComponent from "../../components/choice/ConsentComponent.js";

export default class ConsentView extends ChoiceView {
    constructor(controller) {
        super(controller, ConsentComponent);
    }

    destroy() {
        super.destroy();
    }
}
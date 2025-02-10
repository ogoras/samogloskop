import RecordingView from "../RecordingView.js";
import StatsStackComponent from "../../components/stack/StatsStackComponent.js";

export default class StatsView extends RecordingView {
    constructor(controller, recorder, prev) {
        super(controller, recorder, prev);
        if (this.constructor === StatsView) {
            throw new TypeError(`Cannot instantiate abstract class ${this.constructor.name}`);
        }

        this.stackComponent = new StatsStackComponent(this.stackComponent);
    }
}

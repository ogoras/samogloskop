import RecordingView from "../RecordingView.js";
import StatsStackComponent from "../../components/stack/StatsStackComponent.js";

export default class StatsView extends RecordingView {
    constructor(controller, recorder, prev) {
        super(controller, recorder, prev);
        if (this.constructor === StatsView) {
            throw new TypeError(`Cannot instantiate abstract class ${this.constructor.name}`);
        }
    }

    set progressTime(time) {
        this.validate();
        this.stackComponent.updateProgress(time);
    }

    set intensityStats(stats) {
        this.validate();
        this.stackComponent.intensityStats = stats;
    }

    validate() {
        if (!(this.stackComponent instanceof StatsStackComponent)) {
            throw new Error("stackComponent is not an instance of StatsStackComponent");
        }
    }
}

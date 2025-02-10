import RecordingComponent from "./RecordingComponent.js";
import MoreInfo from "../MoreInfo.js";
import Component from "../Component.js";

export default class SideComponent extends Component {
    constructor(parent, recorder) {
        super("side-container", null, parent);
        this.recordingComponent = new RecordingComponent(this, recorder);
        this.moreInfo = new MoreInfo(this);
    }

    feed(samples) {
        this.recordingComponent.feed(samples);
    }

    stopRecording() {
        this.recordingComponent.stopRecording();
    }

    destroy() {
        this.recordingComponent.destroy();
        this.moreInfo.destroy();
        super.destroy();
    }
}
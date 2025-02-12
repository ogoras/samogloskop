import RecordingComponent from "./RecordingComponent.js";
import MoreInfo from "../MoreInfo.js";
import Component from "../Component.js";
import SelectorsComponent from "../selectors/SelectorsComponent.js";

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

    createVowelSelectors(plotComponent, nativeOnly) {
        this.selectorsComponent = new SelectorsComponent(this, plotComponent, nativeOnly);
        this.recordingComponent.after(this.selectorsComponent);
        return this.selectorsComponent;
    }
}
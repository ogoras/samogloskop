import View from '../View.js';
import SettingsView from '../SettingsView.js';
import FormantsComponent from '../components/recording/FormantsComponent.js';
import SideComponent from '../components/recording/SideComponent.js';

export default class RecordingView extends View {
    constructor(controller, recorder, prev) {        
        super(controller);

        if (this.constructor === RecordingView) {
            throw new TypeError(`Cannot instantiate abstract class ${this.constructor.name}`);
        }

        if (!(prev instanceof RecordingView)) {
            document.body.innerHTML = "";
            document.body.classList.add("recording-view");

            this.formantsComponent = new FormantsComponent();
            this.stackComponent = this.formantsComponent.createStackComponent();
            this.sideComponent = new SideComponent(this, recorder);
        }
        else {
            this.formantsComponent = prev.formantsComponent;
            this.formantsComponent.parent = this;
            
            this.stackComponent = prev.stackComponent;
            this.stackComponent.parent = this;

            this.sideComponent = prev.sideComponent;
            this.sideComponent.parent = this;
        }
    }

    feed(samples) {
        this.sideComponent.feed(samples);
    }

    openSettings() {
        this.sideComponent.stopRecording();
        document.body.classList.remove("recording-view");
        this.formantsComponent.hidden = true;
        this.sideComponent.hidden = true;
        this.popup = new SettingsView(this.controller.settingsController, this.closeSettings.bind(this), this.args);
        this.controller.pauseRendering?.();
    }

    closeSettings() {
        document.body.classList.add("recording-view");
        this.formantsComponent.hidden = false;
        this.sideComponent.hidden = false;
        this.restore?.();
        this.controller.resumeRendering?.();
    }

    destroy() {
        this.formantsComponent.destroy();
        this.sideComponent.destroy();

        document.body.innerHTML = "";
        document.body.classList.remove("recording-view");
    }

    recordingStarted() {
        this.stackComponent.recordingStarted?.();
    }

    recordingStopped() {
        this.stackComponent.recordingStopped?.();
    }
}
import View from '../View.js';
import SettingsView from '../SettingsView.js';
import FormantsComponent from '../components/recording/FormantsComponent.js';
import SideComponent from '../components/recording/SideComponent.js';
import StackComponent from "../components/stack/StackComponent.js";

export default class RecordingView extends View {
    set disabled(value) {
        this.sideComponent.recordingComponent.disabled = value;
    }

    get disabled() {
        return this.sideComponent.recordingComponent.disabled;
    }

    constructor(controller, recorder, prev, addStackToSide = false) {        
        super(controller);

        this.recorder = recorder;

        if (this.constructor === RecordingView) {
            throw new TypeError(`Cannot instantiate abstract class ${this.constructor.name}`);
        }

        if (!(prev instanceof RecordingView)) {
            document.body.innerHTML = "";
            document.body.classList.add("recording-view");

            this.formantsComponent = new FormantsComponent(this);
            this.sideComponent = new SideComponent(this, recorder);
            if (addStackToSide) {
                this.stackComponent = new StackComponent(this.sideComponent);
                this.sideComponent.recordingComponent.element.after(this.stackComponent.element);
            } else {
                this.stackComponent = new StackComponent(this.formantsComponent.createCenterDiv());
            }
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
    
    refreshRecording() {
        if (this.recorder.recording) {
            this.recordingStarted();
        } else {
            this.recordingStopped();
        }
    }

    feedFormants(formants) {
        this.assertSpeechFormants?.();
        this.plotComponent?.feed(formants);
    }

    feedSmoothed(formants) {
        if (!formants) return;
        this.assertSpeechFormants?.();
        this.plotComponent?.feedSmoothed(formants);
    }
}
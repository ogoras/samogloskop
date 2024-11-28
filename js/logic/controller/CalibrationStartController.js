import Controller from "./Controller.js";
import RecordingView from "../../view/RecordingView.js";
import nextController from "./nextController.js";
import AudioRecorder from "../recording/Recorder.js";
import Buffer from "../util/Buffer.js";
import SettingsController from "./SettingsController.js";

export default class CalibrationStartController extends Controller {
    init(prev) {
        let sm = this.sm = prev.sm;
        let lsm = this.lsm = prev.lsm;
        this.settingsController = SettingsController.getInstance();
        this.settingsController.init(this);
        let recorder = this.recorder = new AudioRecorder();
        this.view = new RecordingView(this, recorder);

        let interval = setInterval(() => {
            if (this.recorder.samplesCollected >= 8) {
                clearInterval(interval);
                this.continue();
            }
        }, 100);
    }

    continue() {
        this.sm.advance();
        nextController(this);
    }
}
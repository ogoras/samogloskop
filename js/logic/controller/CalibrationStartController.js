import Controller from "./Controller.js";
import RecordingView from "../../view/RecordingView.js";
import proceedToController from "./procedToController.js";
import AudioRecorder from "../recording/Recorder.js";
import Buffer from "../util/Buffer.js";
import SettingsController from "./SettingsController.js";

const formantCount = 20;

export default class CalibrationStartController extends Controller {
    formantsBuffer = new Buffer(formantCount);

    init(prev) {
        let sm = this.sm = prev.sm;
        let lsm = this.lsm = prev.lsm;
        this.settingsController = SettingsController.getInstance();
        this.settingsController.init(this);
        let recorder = this.recorder = new AudioRecorder();
        this.view = new RecordingView(this, recorder);
        let sampleRate = recorder.sampleRate;
        this.samplesBuffer = new Buffer(sampleRate / 20);

        recorder.onStart = () => {
            this.samplesBuffer.clear();
            this.formantsBuffer.clear();
        };

        let interval = setInterval(() => {
            if (this.recorder.samplesCollected >= 8) {
                clearInterval(interval);
                this.continue();
            }
        }, 100);
    }

    continue() {
        this.sm.advance();
        proceedToController(this);
    }
}
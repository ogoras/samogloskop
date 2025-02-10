import Controller from "../Controller.js";
import SettingsController from "../SettingsController.js";
import AudioRecorder from "../../recording/Recorder.js";

export default class RecordingController extends Controller {
    recorder?: AudioRecorder;

    constructor() {
        super();
        if (this.constructor === RecordingController) {
            throw new TypeError(`Abstract class "${this.constructor.name}" cannot be instantiated directly.`);
        }
    }

    override init(prev: Controller) {
        this.initRecorder(prev);
        this.initSettings(prev);
    }

    initRecorder(prev: Controller) {
        super.init(prev);
        this.recorder = prev.recorder ?? new AudioRecorder();
    }

    initSettings(prev: Controller) {
        this.settingsController = SettingsController.getInstance();
        this.settingsController.init(this);
    }

    protected override validate(): void {
        super.validate();
        if (!this.recorder) throw new Error("Recorder not initialized.");
    }
}
import Controller from "../Controller.js";
import SettingsController from "../SettingsController.js";
import AudioRecorder from "../../recording/Recorder.js";
import RecordingView from "../../../view/RecordingView.js";

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
        this.initSettingsAndView(prev);
    }

    initRecorder(prev: Controller) {
        super.init(prev);
        this.recorder = prev.recorder ?? new AudioRecorder();
    }

    initSettingsAndView(prev: Controller) {
        this.settingsController = SettingsController.getInstance();
        this.settingsController.init(this);
        if (prev.view instanceof RecordingView) {
            this.view = prev.view;
            this.view.controller = this;
            this.view.updateView();
        }
        else this.view = new RecordingView(this, this.recorder);
    }

    protected override validate(): void {
        super.validate();
        if (!this.recorder) throw new Error("Recorder not initialized.");
    }
}
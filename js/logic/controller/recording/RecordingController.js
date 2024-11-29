import Controller from "../Controller.js";
import SettingsController from "../SettingsController.js";
import AudioRecorder from "../../recording/Recorder.js";
import RecordingView from "../../../view/RecordingView.js";

export default class RecordingController extends Controller {
    constructor() {
        super();
        if (this.constructor === RecordingController) {
            throw new TypeError(`Abstract class "${this.constructor.name}" cannot be instantiated directly.`);
        }
    }

    init(prev) {
        this.initRecorder(prev);
        this.initSettingsAndView(prev);
    }

    initRecorder(prev) {
        super.init(prev);
        this.recorder = prev.recorder ?? new AudioRecorder();
    }

    initSettingsAndView(prev) {
        this.settingsController = SettingsController.getInstance();
        this.settingsController.init(this);
        if (prev.view) {
            this.view = prev.view;
            this.view.controller = this;
            this.view.updateView();
        }
        else this.view = new RecordingView(this, this.recorder);
    }   
}
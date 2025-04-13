import Controller from "../Controller.js";
import SettingsController from "../SettingsController.js";
import AudioRecorder from "../../recording/Recorder.js";
import TIME_TARGET from "../../../const/TIME.js";

export default class RecordingController extends Controller {
    recorder?: AudioRecorder;
    #timeSpentInFocus = 0;
    #lastFocused: number | null = null;
    #abortController?: AbortController;
    #timerInitiated = false;

    get timeSpentInFocus() { return this.#timeSpentInFocus; }

    constructor() {
        super();
        if (this.constructor === RecordingController) {
            throw new TypeError(`Abstract class "${this.constructor.name}" cannot be instantiated directly.`);
        }
    }

    override init(prev: Controller) {
        if (this.initStart(prev)) return;
        this.initSettings(prev);
        this.initTimer(prev);
    }

    initStart(prev: Controller) {
        this.#timeSpentInFocus = prev.lsm!.getTimeSpentForToday() ?? 0;

        super.init(prev);

        this.recorder = prev.recorder ?? new AudioRecorder();

        return false;
    }

    initSettings(prev: Controller) {
        this.settingsController = SettingsController.getInstance();
        this.settingsController.init(this);
    }

    initTimer(prev: Controller) {
        // check if window has focus
        this.#lastFocused = document.hasFocus() ? Date.now() : null;
        this.view.timer?.show(this.#timeSpentInFocus);
        if (document.hasFocus()) this.view.timer?.resume();

        this.#abortController = new AbortController();
        const signal = this.#abortController.signal;
        addEventListener("focus", this.#onFocus.bind(this), { signal });
        addEventListener("blur", this.#onBlur.bind(this), { signal });
        addEventListener("visibilitychange", () => {
                if (document.hidden && this.#lastFocused !== null) {
                    this.#onBlur();
                }
            }, 
            { signal }
        );

        this.#timerInitiated = true;
    }

    checkIfDailyTargetReached() {
        let timeSpent = this.#timeSpentInFocus;
        if (this.#lastFocused) timeSpent += Date.now() - this.#lastFocused;
        const reached = timeSpent >= TIME_TARGET * 1000;

        if (reached) {
            if (!this.onReached?.()) {
                this.view.notifyDailyTargetReached();
            }
        }

        return reached;
    }

    #onFocus() {
        if (this.#lastFocused !== null) {
            // Got this error once, don't know how to reproduce it
            // TrainingController.js:49 Uncaught Error: lastFocused is not null on the focus event
            //      at #onFocus (TrainingController.js:49:19)
            console.log("lastFocused:");
            console.log(this.#lastFocused);
            console.log("Now:");
            console.log(Date.now());
            throw new Error("lastFocused is not null on the focus event");
        }
        this.#lastFocused = Date.now();
        this.view.timer?.resume();
    }

    #onBlur() {
        if (this.#lastFocused === null) throw new Error("lastFocused is null on the blur event");
        this.#timeSpentInFocus += Date.now() - this.#lastFocused;
        this.lsm!.setTimeSpentForToday(this.#timeSpentInFocus);
        this.#lastFocused = null;
        this.view.timer?.pauseAndUpdate(this.#timeSpentInFocus);
    }

    stopCountingTime() {
        if (!this.#timerInitiated) return;

        if (document.hasFocus()) {
            this.#onBlur();
            try {
                this.view.timer?.hide();
            } catch (e) {
                console.log(e);
            }
        }
        this.#abortController!.abort();

        this.#timerInitiated = false;
    }

    protected override validate(): void {
        super.validate();
        if (!this.recorder) throw new Error("Recorder not initialized.");
    }
}
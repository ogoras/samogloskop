import Vowels from "../../../model/vowels/Vowels.js";
import SmoothingController from "./SmoothingController.js";
import ForeignRecordings from "../../../model/recordings/ForeignRecordings.js";
import nextController from "../nextController.js";
import LanguageWords from "../../../model/example_words/LanguageWords.js";
import TestGroupView from "../../../frontend/view/training/TestGroupView.js";
import ControlGroupView from "../../../frontend/view/training/ControlGroupView.js";
import ComeBackTomorrowView from "../../../frontend/view/training/ComeBackTomorrowView.js";
import TIME_TARGET from "../../../const/TIME.js";
import LocalStorageMediator from "../../../model/LocalStorageMediator.js";
import State from "../../../const/enum/State.js";

export default class TrainingController extends SmoothingController {
    #discarded = false;
    #timeSpentInFocus = 0;
    #lastFocused = null;
    #abortController;

    get timeSpentInFocus() { return this.#timeSpentInFocus; }

    async init(prev) {
        this.#timeSpentInFocus = LocalStorageMediator.getInstance().getTimeSpentForToday() ?? 0;

        if (this.#timeSpentInFocus >= TIME_TARGET * 1000) {
            this.view = new ComeBackTomorrowView(this)
            this.#discarded = true;
        }

        if (this.#discarded) return;
        super.init(prev);

        this.petersonBarney = await Vowels.create("EN", "peterson_barney");
        this.englishRecordings = prev.englishRecordings ?? await ForeignRecordings.create("EN");
        this.view.addDatasets(this.petersonBarney, this.englishRecordings);

        LanguageWords.create(exampleWords => {
            this.view.addWords(exampleWords);
        }, this.englishRecordings);

        // check if window has focus
        this.#lastFocused = document.hasFocus() ? Date.now() : null;
        this.view.timer.show(this.#timeSpentInFocus);
        if (document.hasFocus()) this.view.timer.resume();

        this.#abortController = new AbortController();
        const signal = this.#abortController.signal;
        addEventListener("focus", this.#onFocus.bind(this), { signal });
        addEventListener("blur", this.#onBlur.bind(this), { signal });
        addEventListener("visibilitychange", (event) => {
                if (document.hidden && this.#lastFocused !== null) {
                    this.#onBlur();
                }
            }, 
            { signal }
        );
    }

    initView(prev) {
        if (this.#discarded) return;

        const TrainingView = this.lsm.isControlGroup ? ControlGroupView : TestGroupView;
        this.view = new TrainingView(this, this.recorder, prev?.view);
        if (this.lsm.isControlGroup) this.recorder.stopRecording();
    }

    checkIfDailyTargetReached() {
        let timeSpent = this.#timeSpentInFocus;
        if (this.#lastFocused) timeSpent += Date.now() - this.#lastFocused;
        const reached = timeSpent >= TIME_TARGET * 1000;

        if (reached) {
            this.view.notifyDailyTargetReached();
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
        this.view.timer.resume();
    }

    #onBlur() {
        if (this.#lastFocused === null) throw new Error("lastFocused is null on the blur event");
        this.#timeSpentInFocus += Date.now() - this.#lastFocused;
        this.lsm.setTimeSpentForToday(this.#timeSpentInFocus);
        this.#lastFocused = null;
        this.view.timer.pauseAndUpdate(this.#timeSpentInFocus);
    }

    renderLoop() {
        if (super.renderLoop() || this.#discarded) return true;
        this.processFormants(false);
        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }

    stopCountingTime() {
        if (document.hasFocus()) {
            this.#onBlur();
            try {
                this.view.timer.hide();
            } catch (e) {
                console.log(e);
            }
        }
        this.#abortController.abort();
    }

    next() {
        if (this.#discarded) return;

        this.stopCountingTime();

        this.sm.advance();
        this.breakRenderLoop();
        nextController(this);
        this.#discarded = true;
    }

    recalibrate() {
        if (this.#discarded) return;

        this.stopCountingTime();

        super.recalibrate();
    }

    retest() {
        if (this.#discarded) return;
        this.validate();

        this.sm.state = State.get("GATHERING_FOREIGN_INITIAL");
        nextController(this);
        this.breakRenderLoop();
    }
}
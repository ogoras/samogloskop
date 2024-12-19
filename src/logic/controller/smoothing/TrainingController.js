import Vowels from "../../../model/vowels/Vowels.js";
import SmoothingController from "./SmoothingController.js";
import ForeignRecordings from "../../../model/recordings/ForeignRecordings.js";
import nextController from "../nextController.js";

export default class TrainingController extends SmoothingController {
    #discarded = false;
    #timeSpentInFocus = 0;
    #lastFocused = null;
    #abortController;

    async init(prev) {
        if (this.#discarded) return;
        super.init(prev);

        this.petersonBarney = await Vowels.create("EN", "peterson_barney");
        this.englishRecordings = prev.englishRecordings ?? await ForeignRecordings.create("EN");
        this.view.addDatasets(this.petersonBarney, this.englishRecordings.combinedVowels);

        // check if window has focus
        this.#lastFocused = document.hasFocus() ? Date.now() : null;
        this.#timeSpentInFocus = this.lsm.timeSpentInTraining ?? 0;
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

    #onFocus() {
        if (this.#lastFocused !== null) throw new Error("lastFocused is not null on the focus event");
        this.#lastFocused = Date.now();
        this.view.timer.resume();
    }

    #onBlur() {
        if (this.#lastFocused === null) throw new Error("lastFocused is null on the blur event");
        this.#timeSpentInFocus += Date.now() - this.#lastFocused;
        this.lsm.timeSpentInTraining = this.#timeSpentInFocus;
        this.#lastFocused = null;
        this.view.timer.pauseAndUpdate(this.#timeSpentInFocus);
    }

    renderLoop() {
        if (super.renderLoop() || this.#discarded) return true;
        this.processFormants(false);
        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }

    #stopCountingTime() {
        if (document.hasFocus()) {
            this.#onBlur();
            this.view.timer.hide();
        }
        this.#abortController.abort();
    }

    next() {
        if (this.#discarded) return;

        this.#stopCountingTime();

        this.sm.advance();
        this.breakRenderLoop();
        nextController(this);
        this.#discarded = true;
    }

    recalibrate() {
        if (this.#discarded) return;

        this.#stopCountingTime();

        super.recalibrate();
    }
}
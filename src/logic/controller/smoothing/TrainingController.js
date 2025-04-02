import Vowels from "../../../model/vowels/Vowels.js";
import SmoothingController from "./SmoothingController.js";
import ForeignRecordings from "../../../model/recordings/ForeignRecordings.js";
import nextController from "../nextController.js";
import LanguageWords from "../../../model/example_words/LanguageWords.js";
import TestGroupView from "../../../frontend/view/training/TestGroupView.js";
import ControlGroupView from "../../../frontend/view/training/ControlGroupView.js";
import State from "../../../const/enum/State.js";
import WelcomeBackView from "../../../frontend/view/training/WelcomeBackView.js";
import nullish from "../../util/nullish.js";

export default class TrainingController extends SmoothingController {
    #discarded = false;
    #cachedPrev;
    #onReachCalled = false;

    async init(prev) {
        if (this.#discarded) return;

        if (nullish(prev.lsm.getTimeSpentForToday(false)) && !prev.lsm.isControlGroup) {
            this.#cachedPrev = prev;
            this.lsm = prev.lsm;
            this.view = new WelcomeBackView(this);
            return;
        }

        super.init(prev);

        if (this.lsm.canFinish()) {
            this.next();
            return;
        }

        this.petersonBarney = await Vowels.create("EN", "peterson_barney");
        this.englishRecordings = prev.englishRecordings ?? await ForeignRecordings.create("EN");
        this.view.addDatasets?.(this.petersonBarney, this.englishRecordings);

        LanguageWords.create(exampleWords => {
            this.view.addWords?.(exampleWords);
        }, this.englishRecordings);
    }

    initView(prev) {
        if (this.#discarded) return;

        const TrainingView = this.lsm.isControlGroup ? ControlGroupView : TestGroupView;
        this.view = new TrainingView(this, this.recorder, prev?.view);
        if (this.lsm.isControlGroup) this.recorder.stopRecording();
    }

    renderLoop() {
        if (super.renderLoop() || this.#discarded) return true;
        this.processFormants(false);
        requestAnimationFrame(this.renderLoop.bind(this));
        return false;
    }

    onReached() {
        const canFinish = this.lsm.willBeAbleToFinishToday();
        if (this.#onReachCalled) return canFinish;
        this.#onReachCalled = true;
        if (canFinish) {
            window.alert("Gratulacje! Minęło 30 minut dzisiaj! To już prawie koniec Twojego badania. Teraz przejdziesz do testu końcowego.");
            this.next();
        }
        return canFinish;
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

    startNewDay() {
        this.lsm.setTimeSpentForToday(0);
        this.init(this.#cachedPrev);
    }
}
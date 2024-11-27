import arrToObj from "../logic/util/arrToObj.js";
import Enum from "./Enum.js";

export default class State extends Enum {
    static allowNew = true;

    constructor(index, name) {
        super(index, name);
        if (!State.allowNew) {
            throw new Error("State instances cannot be created directly. Use getState() instead.");
        }
    }

    static #convertToState(state) {
        if (!(state instanceof State)) {
            state = State.get(state);
        }
        return state;
    }

    after(otherState) {
        return this.index > State.#convertToState(otherState).index;
    }

    afterOrEqual(otherState) {
        return this.index >= State.#convertToState(otherState).index;
    }

    before(otherState) {
        return this.index < State.#convertToState(otherState).index;
    }

    beforeOrEqual(otherState) {
        return this.index <= State.#convertToState(otherState).index;
    }

    is(otherState) {
        return this === State.#convertToState(otherState);
    }
}

const STATE_NAMES = [
    "PRESET_SELECTION",
    "NO_SAMPLES_YET",
    "GATHERING_SILENCE",
    "WAITING_FOR_SPEECH",
    "MEASURING_SPEECH",
    "SPEECH_MEASURED",
    "WAITING_FOR_VOWELS",
    "GATHERING_VOWELS",
    "VOWEL_GATHERED",
    "CONFIRM_VOWELS",
    "INITIAL_FOREIGN",
    "TRAINING",
    "REPEAT_FOREIGN",
    "DONE"
];
const STATES = arrToObj(STATE_NAMES, (...args) => new State(...args));
State.allowNew = false;
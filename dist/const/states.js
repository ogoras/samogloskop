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
    static #convertToState(input) {
        let output;
        if (!(input instanceof State)) {
            output = State.get(input);
        }
        else {
            output = input;
        }
        if (!output)
            throw new Error(`Invalid state: ${input}`);
        return output;
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
    "DATA_CONSENT",
    "PRESET_SELECTION",
    "NO_SAMPLES_YET",
    "GATHERING_SILENCE",
    "WAITING_FOR_SPEECH",
    "MEASURING_SPEECH",
    "SPEECH_MEASURED",
    "GATHERING_NATIVE",
    "CONFIRM_VOWELS",
    "GATHERING_FOREIGN_INITIAL",
    "TRAINING",
    "GATHERING_FOREIGN_REPEAT",
    "DONE"
];
const STATES = arrToObj(STATE_NAMES, (index, name) => new State(index, name));
State.allowNew = false;

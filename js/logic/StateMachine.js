import Singleton from '../Singleton.js';
import State from '../const/states.js';

export default class StateMachine extends Singleton {
    #state;
    #tempState;

    /**
     * @param {State} state
     */
    set state(state) {
        if (state === undefined) state = State.get(0);
        if (this.#state === undefined) {
            this.#state = state;
        } else if (this.#tempState === undefined) {
            this.#tempState = state;
        } else {
            throw new Error(`Tried to set state to ${state} while tempState is already set to ${this.#tempState} and state is already set to ${this.#state}`);
        }
    }

    get state() {
        return this.#tempState ?? this.#state;
    }

    advance() { // returns tempState if it is popped
        if (this.#tempState !== undefined) {
            this.#tempState = this.#tempState.next();
            if (stateSaveable(this.#tempState)) {
                let ret = this.#tempState;
                this.#tempState = undefined;
                return ret;
            }
        } else if (this.#state !== undefined) {
            this.#state = this.#state.next();
            if (stateSaveable(this.#state)) {
                if (this.lsm) {
                    this.lsm.state = this.#state;
                }
            }
        } else {
            throw new Error("Tried to advance state while no state is set.");
        }
        return undefined;
    }
}

const SAVEABLE_STATES = [
    "PRESET_SELECTION",
    "NO_SAMPLES_YET",
    "SPEECH_MEASURED",
    "CONFIRM_VOWELS",
    "TRAINING",
].map((key) => State.get(key));

const MANUALLY_STARTED_STATES = [
    "INITIAL_FOREIGN",
    "REPEAT_FOREIGN"
].map((key) => State.get(key));

function stateSaveable(state) {
    return SAVEABLE_STATES.includes(state);
}

function findGreatestSaveableState(state) {
    if (state.before(SAVEABLE_STATES[0])) {
        return SAVEABLE_STATES[0];
    }
    for (let i = 0; i < SAVEABLE_STATES.length - 1; i++) {
        if (SAVEABLE_STATES[i].beforeOrEqual(state) && SAVEABLE_STATES[i+1].after(state)) {
            return SAVEABLE_STATES[i];
        }
    }
    return SAVEABLE_STATES[SAVEABLE_STATES.length - 1];
}
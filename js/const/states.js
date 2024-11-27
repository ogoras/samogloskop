import arrToObj from "../logic/util/arrToObj.js";

export const STATE_NAMES = [
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
]
export const STATES = arrToObj(STATE_NAMES);

export default STATES;
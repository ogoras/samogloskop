import arrToObj from "../logic/util/arrToObj.js";
import Enum from "./Enum.js";

class Preset extends Enum {
    constructor(index, name, frequency) {
        super(index, name);
        this.frequency = frequency;
    }
}

const PRESET_NAMES = [
    "FEMALE",
    "MALE",
    "CHILD"
];
const PRESET_FREQUENCIES = [
    5500,
    5000,
    8000
]
const PRESETS = arrToObj(PRESET_NAMES, (...args) => new Preset(...args), PRESET_FREQUENCIES);

export default function getPreset(argument) {
    if (typeof argument === "number") {
        return PRESETS[PRESET_NAMES[argument]];
    } else {
        return PRESETS[argument];
    }
}
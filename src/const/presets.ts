import arrToObj from "../logic/util/arrToObj.js";
import Enum from "./Enum.js";

export default class Preset extends Enum {
    static allowNew = true;
    frequency: number;

    constructor(index: number, name: string, frequency: number) {
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
const PRESETS = arrToObj(PRESET_NAMES, (index: number, name: string, frequency: number) => new Preset(index, name, frequency), PRESET_FREQUENCIES);
Preset.allowNew = false;
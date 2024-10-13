import { arrToObj } from "../util/arrToObj.js";

export const PRESET_NAMES = [
    "MALE",
    "FEMALE",
    "CHILD"
];
export const PRESETS = arrToObj(PRESET_NAMES);
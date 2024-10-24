import arrToObj from "../util/arrToObj.js";

export const PRESET_NAMES = [
    "MALE",
    "FEMALE",
    "CHILD"
];
export const PRESETS = arrToObj(PRESET_NAMES);
export const PRESET_FREQUENCIES = [
    5000,
    5500,
    8000
]

export default PRESETS;
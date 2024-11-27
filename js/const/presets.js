import arrToObj from "../logic/util/arrToObj.js";

export const PRESET_NAMES = [
    "FEMALE",
    "MALE",
    "CHILD"
];
export const PRESETS = arrToObj(PRESET_NAMES);
export const PRESET_FREQUENCIES = [
    5500,
    5000,
    8000
]

export default PRESETS;
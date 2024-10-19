import { CalibrationStartView } from "./CalibrationStartView.js";
import { SilenceView } from "./stats_view/SilenceView.js";
import { MeasuringSpeechView } from "./stats_view/MeasuringSpeechView.js";
import { GatheringVowelsView } from "./scatter_view/GatheringVowelsView.js";
import { FreeView } from "./scatter_view/FreeView.js";
import { STATES } from "../../const/states.js";

export const FORMANT_VIEWS = {
    [STATES.NO_SAMPLES_YET]: CalibrationStartView,
    [STATES.GATHERING_SILENCE]: SilenceView,
    [STATES.WAITING_FOR_SPEECH]: MeasuringSpeechView,
    [STATES.MEASURING_SPEECH]: MeasuringSpeechView,
    [STATES.SPEECH_MEASURED]: MeasuringSpeechView,
    [STATES.WAITING_FOR_VOWELS]: GatheringVowelsView,
    [STATES.GATHERING_VOWELS]: GatheringVowelsView,
    [STATES.VOWEL_GATHERED]: GatheringVowelsView,
    [STATES.DONE]: FreeView
}
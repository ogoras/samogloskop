import { CalibrationStartView } from "./CalibrationStartView.js";
import { SilenceView } from "./SilenceView.js";
import { MeasuringSpeechView } from "./MeasuringSpeechView.js";
import { GatheringVowelsView } from "./GatheringVowelsView.js";
import { STATES } from "../../definitions/states.js";

export const FORMANT_VIEWS = {
    [STATES.NO_SAMPLES_YET]: CalibrationStartView,
    [STATES.GATHERING_SILENCE]: SilenceView,
    [STATES.WAITING_FOR_SPEECH]: MeasuringSpeechView,
    [STATES.MEASURING_SPEECH]: MeasuringSpeechView,
    [STATES.SPEECH_MEASURED]: MeasuringSpeechView,
    [STATES.WAITING_FOR_VOWELS]: GatheringVowelsView,
    [STATES.GATHERING_VOWELS]: GatheringVowelsView,
}
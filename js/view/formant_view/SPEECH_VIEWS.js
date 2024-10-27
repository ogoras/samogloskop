import CalibrationStartView from "./CalibrationStartView.js";
import SilenceView from "./stats_view/SilenceView.js";
import MeasuringSpeechView from "./stats_view/MeasuringSpeechView.js";
import GatheringVowelsView from "./scatter_view/GatheringVowelsView.js";
import TrainingView from "./scatter_view/TrainingView.js";
import ConfirmVowelsView from "./scatter_view/ConfirmVowelsView.js";
import GatheringForeignView from "./GatheringForeignView.js";
import STATES from "../../const/states.js";

export default {
    [STATES.NO_SAMPLES_YET]: CalibrationStartView,
    [STATES.GATHERING_SILENCE]: SilenceView,
    [STATES.WAITING_FOR_SPEECH]: MeasuringSpeechView,
    [STATES.MEASURING_SPEECH]: MeasuringSpeechView,
    [STATES.SPEECH_MEASURED]: MeasuringSpeechView,
    [STATES.WAITING_FOR_VOWELS]: GatheringVowelsView,
    [STATES.GATHERING_VOWELS]: GatheringVowelsView,
    [STATES.VOWEL_GATHERED]: GatheringVowelsView,
    [STATES.CONFIRM_VOWELS]: ConfirmVowelsView,
    [STATES.INITIAL_FOREIGN]: GatheringForeignView,
    [STATES.TRAINING]: TrainingView,
    [STATES.REPEAT_FOREIGN]: GatheringForeignView
}
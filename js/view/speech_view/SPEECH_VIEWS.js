import CalibrationStartView from "./CalibrationStartView.js";
import SilenceView from "./stats_view/SilenceView.js";
import MeasuringSpeechView from "./stats_view/MeasuringSpeechView.js";
import GatheringNativeView from "./scatter_view/GatheringNativeView.js";
import TrainingView from "./scatter_view/TrainingView.js";
import ConfirmVowelsView from "./scatter_view/ConfirmVowelsView.js";
import GatheringForeignView from "./GatheringForeignView.js";

export default {
    "NO_SAMPLES_YET": CalibrationStartView,
    "GATHERING_SILENCE": SilenceView,
    "WAITING_FOR_SPEECH": MeasuringSpeechView,
    "MEASURING_SPEECH": MeasuringSpeechView,
    "SPEECH_MEASURED": MeasuringSpeechView,
    "GATHERING_NATIVE": GatheringNativeView,
    "CONFIRM_VOWELS": ConfirmVowelsView,
    "GATHERING_FOREIGN_INITIAL": GatheringForeignView,
    "TRAINING": TrainingView,
    "GATHERING_FOREIGN_REPEAT": GatheringForeignView
}
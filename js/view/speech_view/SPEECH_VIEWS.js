import CalibrationStartView from "./CalibrationStartView.js";
import SilenceView from "./stats_view/SilenceView.js";
import MeasuringSpeechView from "./stats_view/MeasuringSpeechView.js";
import GatheringVowelsView from "./scatter_view/GatheringVowelsView.js";
import TrainingView from "./scatter_view/TrainingView.js";
import ConfirmVowelsView from "./scatter_view/ConfirmVowelsView.js";
import GatheringForeignView from "./GatheringForeignView.js";

export default {
    "NO_SAMPLES_YET": CalibrationStartView,
    "GATHERING_SILENCE": SilenceView,
    "WAITING_FOR_SPEECH": MeasuringSpeechView,
    "MEASURING_SPEECH": MeasuringSpeechView,
    "SPEECH_MEASURED": MeasuringSpeechView,
    "WAITING_FOR_VOWELS": GatheringVowelsView,
    "GATHERING_VOWELS": GatheringVowelsView,
    "VOWEL_GATHERED": GatheringVowelsView,
    "CONFIRM_VOWELS": ConfirmVowelsView,
    "INITIAL_FOREIGN": GatheringForeignView,
    "TRAINING": TrainingView,
    "REPEAT_FOREIGN": GatheringForeignView
}
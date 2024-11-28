import PresetController from "./choice_controller/PresetController.js";
import ConsentController from "./choice_controller/ConsentController.js";
import CalibrationStartController from "./CalibrationStartController.js";
import SilenceController from "./SilenceController.js";
import MeasuringSpeechController from "./MeasuringSpeechController.js";
import GatheringVowelsController from "./GatheringVowelsController.js";
import ConfirmVowelsController from "./ConfirmVowelsController.js";
import GatheringForeignController from "./GatheringForeignController.js";
import TrainingController from "./TrainingController.js";

const CONTROLLER_CLASSES = {
    "DATA_CONSENT": ConsentController,
    "PRESET_SELECTION": PresetController,
    "NO_SAMPLES_YET": CalibrationStartController,
    "GATHERING_SILENCE": SilenceController,
    "WAITING_FOR_SPEECH": MeasuringSpeechController,
    "MEASURING_SPEECH": MeasuringSpeechController,
    "SPEECH_MEASURED": MeasuringSpeechController,
    "GATHERING_NATIVE": GatheringVowelsController,
    "CONFIRM_VOWELS": ConfirmVowelsController,
    "GATHERING_FOREIGN_INITIAL": GatheringForeignController,
    "TRAINING": TrainingController,
    "GATHERING_FOREIGN_REPEAT": GatheringForeignController
}

function GetControllerClass(state) {
    let controllerClass = CONTROLLER_CLASSES[state.name];
    if (controllerClass === undefined) {
        throw new Error(`No controller class found for state ${state}`);
    }
    return controllerClass;
}

export default function nextController(previousController) {
    let controller = GetControllerClass(previousController.sm.state).getInstance();
    controller.init(previousController);
}
import ChoiceController from "./ChoiceController.js";
import CalibrationStartController from "./recording/CalibrationStartController.js";
import SilenceController from "./recording/render/SilenceController.js";
import MeasuringSpeechController from "./recording/render/MeasuringSpeechController.js";
import GatheringVowelsController from "./recording/render/GatheringVowelsController.js";
import ConfirmVowelsController from "./recording/render/ConfirmVowelsController.js";
import GatheringForeignController from "./recording/render/GatheringForeignController.js";
import TrainingController from "./recording/render/TrainingController.js";

const CONTROLLER_CLASSES = {
    "DATA_CONSENT": ChoiceController,
    "PRESET_SELECTION": ChoiceController,
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
    const controllerClass = CONTROLLER_CLASSES[state.name];
    if (controllerClass === undefined) {
        throw new Error(`No controller class found for state ${state}`);
    }
    return controllerClass;
}

export default function nextController(previousController, ...args) {
    const controller = GetControllerClass(previousController.sm.state).getInstance();
    controller.init(previousController, ...args);
    return controller;
}
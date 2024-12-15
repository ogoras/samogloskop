import ChoiceController from "./ChoiceController.js";
import CalibrationStartController from "./recording/CalibrationStartController.js";
import SilenceController from "./render/SilenceController.js";
import MeasuringSpeechController from "./render/MeasuringSpeechController.js";
import GatheringVowelsController from "./smoothing/GatheringVowelsController.js";
import ConfirmVowelsController from "./smoothing/ConfirmVowelsController.js";
import GatheringForeignController from "./smoothing/GatheringForeignController.js";
import TrainingController from "./smoothing/TrainingController.js";
import DataDownloadController from "./DataDownloadController.js";
import State from "../../const/State.js";
import Controller from "./Controller.js";
import LocalStorageMediator from "../../model/LocalStorageMediator.js";
import StateMachine from "../StateMachine.js";

const CONTROLLER_CLASSES: {
    [key: string]: typeof Controller
} = {
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
    "GATHERING_FOREIGN_REPEAT": GatheringForeignController,
    "DONE": DataDownloadController
}

function GetControllerClass(state: State) {
    const controllerClass = CONTROLLER_CLASSES[state.name];
    if (controllerClass === undefined) {
        throw new Error(`No controller class found for state ${state}`);
    }
    return controllerClass;
}

type controllerLike = Controller | {sm: StateMachine, lsm: LocalStorageMediator};

export default function nextController(previousController: controllerLike, ...args: any[]) {
    if (!previousController.sm?.state) throw new Error("StateMachine not initialized");
    const controller = GetControllerClass(previousController.sm.state).getInstance();
    controller.init(previousController, ...args);
    return controller;
}
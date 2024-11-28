import PresetController from "./PresetController.js";
import ConsentController from "./ConsentController.js";

const CONTROLLER_CLASSES = {
    "DATA_CONSENT": ConsentController,
    "PRESET_SELECTION": PresetController,
}

function GetControllerClass(state) {
    let controllerClass = CONTROLLER_CLASSES[state.name];
    if (controllerClass === undefined) {
        throw new Error(`No controller class found for state ${state}`);
    }
    return controllerClass;
}

export default function proceedToController({sm, lsm}) {
    let controller = GetControllerClass(sm.state).getInstance();
    controller.init({sm, lsm});
}
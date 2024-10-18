import { ConsentView } from './view/ConsentView.js';
import { PresetView } from './view/PresetView.js';
import { RecordingView } from './view/RecordingView.js';

import { VERSION_MAJOR, VERSION_MINOR } from './definitions/version.js';
import { STATES, STATE_NAMES } from './definitions/states.js';
import { PRESETS, PRESET_NAMES } from './definitions/presets.js';

let dataConsentGiven = localStorage.getItem("accepted") === "true";
if (dataConsentGiven && !localStorage.getItem("version")) {
    localStorage.setItem("version", "0.0");
}
let preset = localStorage.getItem("preset");
let consentPopup = !dataConsentGiven;
let state = STATES[localStorage.getItem("state")];
if (state === undefined || preset === undefined) state = STATES.PRESET_SELECTION;
let intensityStats = localStorage.getItem("intensityStats");
if (intensityStats === undefined && state > STATES.NO_SAMPLES_YET) state = STATES.NO_SAMPLES_YET;
let view = null;

async function onStateChange(updates = {}, constructNewView = true) {
    if (updates.newState !== undefined) {
        state = updates.newState;
        if (dataConsentGiven && stateSaveable(state)) 
            localStorage.setItem("state", STATE_NAMES[state]);
    }
    if (updates.preset !== undefined) {
        preset = updates.preset;
        if (dataConsentGiven) localStorage.setItem("preset", PRESET_NAMES[preset]);
        state = STATES.NO_SAMPLES_YET;
        if (dataConsentGiven) localStorage.setItem("state", STATE_NAMES[state]);
    }
    if (updates.accepted !== undefined) {
        dataConsentGiven = updates.accepted;
        if (dataConsentGiven) {
            localStorage.setItem("accepted", "true");
            localStorage.setItem("version", `${VERSION_MAJOR}.${VERSION_MINOR}`);
        }
        else {
            localStorage.clear();
        }
        consentPopup = false;
    }
    if (updates.intensityStats !== undefined) {
        if (dataConsentGiven) localStorage.setItem("intensityStats", updates.intensityStats);
    }
    if (updates.userVowels !== undefined) {
        if (dataConsentGiven) localStorage.setItem("userVowels", updates.userVowels);
    }
    if (constructNewView) {
        if (consentPopup) view = new ConsentView(onStateChange);
        else if (state === STATES.PRESET_SELECTION) view = new PresetView(onStateChange);
        else view = new RecordingView(onStateChange, state, preset);
    }
}

const SAVEABLE_STATES = [
    STATES.PRESET_SELECTION,
    STATES.NO_SAMPLES_YET,
    STATES.SPEECH_MEASURED,
    STATES.DONE
]

function stateSaveable(state) {
    return SAVEABLE_STATES.includes(state);
}

onStateChange();
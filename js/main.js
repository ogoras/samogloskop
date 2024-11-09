import ConsentView from './view/ConsentView.js';
import PresetView from './view/PresetView.js';
import RecordingView from './view/RecordingView.js';

import AudioRecorder from './recording/Recorder.js';
import FormantProcessor from './data/FormantProcessor.js';
import Vowels from './data/Vowels.js';

import { VERSION_MAJOR, VERSION_MINOR } from './const/version.js';
console.log(`%cSamogłoskop v${VERSION_MAJOR}.${VERSION_MINOR}`,
     "font-size: 3rem; font-weight: bold;");
import { STATES, STATE_NAMES } from './const/states.js';
import { PRESETS, PRESET_NAMES } from './const/presets.js';

let dataConsentGiven = localStorage.getItem("accepted") === "true";
if (dataConsentGiven && !localStorage.getItem("version")) {
    localStorage.setItem("version", "0.0");
}
let localStorageVersion = localStorage.getItem("version")
if (localStorageVersion !== `${VERSION_MAJOR}.${VERSION_MINOR}`) {
    if (localStorageVersion === "0.1") {
        // 0.1 -> 0.2 conversion
        if (localStorage.getItem("state") === "DONE")
            localStorage.setItem("state", "CONFIRM_VOWELS");
    }
    else if (dataConsentGiven) {
        // for now, local storage v0.0 is not supported
        // TODO: implement a conversion mechanism for versions 1.x and higher
        console.log(`Conversion not implemented for version ${localStorageVersion}`);
        localStorage.clear();
        dataConsentGiven = false;
    }
}
let preset = PRESETS[localStorage.getItem("preset")];
let consentPopup = !dataConsentGiven;
let state = STATES[localStorage.getItem("state")];
if (state === undefined || preset === undefined) state = STATES.PRESET_SELECTION;
let tempState;
let intensityStats = localStorage.getItem("intensityStats");
if (intensityStats === undefined && state > STATES.NO_SAMPLES_YET) state = STATES.NO_SAMPLES_YET;
let view = null, audioRecorder = null, formantProcessor = null;
let petersonBarney = new Vowels("EN", "peterson_barney", datasetLoaded);

async function onStateChange(updates = {}, constructNewView = true) {
    if (updates.newState !== undefined) {
        if (tempState !== undefined) {
            // console.log(`tempState updated to ${STATE_NAMES[updates.newState]}`);
            tempState = updates.newState;
            if (stateSaveable(tempState)) {
                tempState = undefined;
                formantProcessor.state = state;
                audioRecorder.stopRecording();
                constructNewView = true;
            }
        } else {
            // console.log(`state updated to ${STATE_NAMES[updates.newState]}`);
            state = updates.newState;
            if (dataConsentGiven && stateSaveable(state)) {
                localStorage.setItem("state", STATE_NAMES[state]);
            }
        }
    }
    if (updates.tempState !== undefined) {
        tempState = updates.tempState;
    }
    if (updates.preset !== undefined) {
        preset = updates.preset;
        if (dataConsentGiven) localStorage.setItem("preset", PRESET_NAMES[preset]);
        if (state === STATES.PRESET_SELECTION) state = STATES.NO_SAMPLES_YET;
        if (dataConsentGiven) localStorage.setItem("state", STATE_NAMES[state]);
        if (formantProcessor) formantProcessor.changePreset(preset);
    }
    if (updates.accepted !== undefined) {
        dataConsentGiven = updates.accepted;
        if (dataConsentGiven) {
            localStorage.setItem("accepted", "true");
            localStorage.setItem("state", STATE_NAMES[findGreatestSaveableState(state)]);
            localStorage.setItem("version", `${VERSION_MAJOR}.${VERSION_MINOR}`);
            if (preset) localStorage.setItem("preset", PRESET_NAMES[preset]);
            if (state >= STATES.SPEECH_MEASURED) {
                localStorage.setItem("intensityStats", formantProcessor.intensityStats.toString());
            }
            if (state >= STATES.CONFIRM_VOWELS) {
                localStorage.setItem("userVowels", formantProcessor.userVowels.toString());
            }
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
        let viewState = tempState ?? state;
        if (consentPopup) view = new ConsentView(onStateChange);
        else if (viewState === STATES.PRESET_SELECTION) view = new PresetView(onStateChange);
        else {
            audioRecorder = new AudioRecorder();
            view = new RecordingView(onStateChange, audioRecorder);
            formantProcessor = new FormantProcessor(audioRecorder.sampleRate, viewState, preset);
            view.updateView(viewState, formantProcessor);
            audioRecorder.onStart = () => {
                formantProcessor.recordingStarted();
                // view.recordingStarted();
            };
            audioRecorder.onStop = () => {
                formantProcessor.recordingStopped();
                // view.recordingStopped();
            };
            renderLoop();
        }
    }
}

function renderLoop() {
    let viewState = tempState ?? state;

    if (audioRecorder.samplesCollected < 8) {
        requestAnimationFrame(renderLoop);
        return;
    }

    const samples = audioRecorder.dump();

    let updates = formantProcessor.feed(samples);

    view.feed(samples, updates, viewState < STATES.CONFIRM_VOWELS);

    let newState = updates.newState;
    if (newState !== undefined) {
        onStateChange({ 
            newState,
            intensityStats: updates.intensityStatsString,
            userVowels: updates.userVowelsString
        }, false);
        viewState = tempState ?? state;
        view.updateView(viewState, formantProcessor);
        if (viewState === STATES.TRAINING && petersonBarney.initialized) view.addDataset(petersonBarney); 
    }

    requestAnimationFrame(renderLoop);
}

function datasetLoaded() {
    let viewState = tempState ?? state;
    if (viewState >= STATES.TRAINING) view.addDataset(petersonBarney);
}

const SAVEABLE_STATES = [
    STATES.PRESET_SELECTION,
    STATES.NO_SAMPLES_YET,
    STATES.SPEECH_MEASURED,
    STATES.CONFIRM_VOWELS,
]

function stateSaveable(state) {
    return SAVEABLE_STATES.includes(state);
}

function findGreatestSaveableState(state) {
    if (state < SAVEABLE_STATES[0]) {
        return SAVEABLE_STATES[0];
    }
    for (let i = 0; i < SAVEABLE_STATES.length - 1; i++) {
        if (SAVEABLE_STATES[i] <= state && SAVEABLE_STATES[i+1] > state) {
            return SAVEABLE_STATES[i];
        }
    }
    return SAVEABLE_STATES[SAVEABLE_STATES.length - 1];
}

onStateChange();
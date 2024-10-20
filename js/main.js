import { ConsentView } from './view/ConsentView.js';
import { PresetView } from './view/PresetView.js';
import { RecordingView } from './view/RecordingView.js';

import { AudioRecorder } from './recording/Recorder.js';
import { FormantProcessor } from './data/FormantProcessor.js';

import { VERSION_MAJOR, VERSION_MINOR } from './const/version.js';
import { STATES, STATE_NAMES } from './const/states.js';
import { PRESETS, PRESET_NAMES } from './const/presets.js';

let dataConsentGiven = localStorage.getItem("accepted") === "true";
if (dataConsentGiven && !localStorage.getItem("version")) {
    localStorage.setItem("version", "0.0");
}
let localStorageVersion = localStorage.getItem("version")
if (localStorageVersion !== `${VERSION_MAJOR}.${VERSION_MINOR}`) {
    // for now, every update will clear the local storage to avoid any conversion issues
    // TODO: implement a conversion mechanism for versions 1.x and higher
    localStorage.clear();
    dataConsentGiven = false;
}
let preset = localStorage.getItem("preset");
let consentPopup = !dataConsentGiven;
let state = STATES[localStorage.getItem("state")];
if (state === undefined || preset === undefined) state = STATES.PRESET_SELECTION;
let intensityStats = localStorage.getItem("intensityStats");
if (intensityStats === undefined && state > STATES.NO_SAMPLES_YET) state = STATES.NO_SAMPLES_YET;
let view = null, audioRecorder = null, formantProcessor = null;

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
        else {
            view = new RecordingView(onStateChange);
            audioRecorder = new AudioRecorder();
            formantProcessor = new FormantProcessor(audioRecorder.sampleRate, state, preset);
            view.updateView(state, formantProcessor);
            audioRecorder.onStart = () => {
                formantProcessor.recordingStarted();
                view.recordingStarted();
            };
            audioRecorder.onStop = () => {
                formantProcessor.recordingStopped();
                view.recordingStopped();
            };
            renderLoop();
        }
    }
}

function renderLoop() {
    if (audioRecorder.samplesCollected < 8) {
        requestAnimationFrame(renderLoop);
        return;
    }

    const samples = audioRecorder.dump();

    let updates = formantProcessor.feed(samples);

    let newState = updates.newState;
    if (newState !== undefined) {
        updates.newState = undefined;
        state = newState;
        onStateChange({ 
            newState,
            intensityStats: updates.intensityStatsString,
            userVowels: updates.userVowelsString
        }, false);
        view.updateView(newState, formantProcessor);
    }

    view.feed(samples, updates, state < STATES.DONE);

    requestAnimationFrame(renderLoop);
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
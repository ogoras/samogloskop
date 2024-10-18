import { CookieView } from './view/CookieView.js';
import { PresetView } from './view/PresetView.js';
import { RecordingView } from './view/RecordingView.js';

import { VERSION_MAJOR, VERSION_MINOR } from './definitions/version.js';
import { STATES, STATE_NAMES } from './definitions/states.js';
import { PRESETS, PRESET_NAMES } from './definitions/presets.js';

let cookiesAccepted = Cookies.get("accepted") === "true";
if (cookiesAccepted && !Cookies.get("version")) {
    Cookies.set("version", "0.0", { expires: 365 });
}
let preset = Cookies.get("preset");
let cookiePopup = !cookiesAccepted;
let state = STATES[Cookies.get("state")];
if (state === undefined || preset === undefined) state = STATES.PRESET_SELECTION;
let intensityStats = Cookies.get("intensityStats");
if (intensityStats === undefined && state > STATES.NO_SAMPLES_YET) state = STATES.NO_SAMPLES_YET;
let view = null;

async function onStateChange(updates = {}, constructNewView = true) {
    if (updates.newState !== undefined) {
        state = updates.newState;
        if (cookiesAccepted && stateSaveable(state)) 
            Cookies.set("state", STATE_NAMES[state], { expires: 365 });
    }
    if (updates.preset !== undefined) {
        preset = updates.preset;
        if (cookiesAccepted) Cookies.set("preset", PRESET_NAMES[preset], { expires: 365 });
        state = STATES.NO_SAMPLES_YET;
        if (cookiesAccepted) Cookies.set("state", STATE_NAMES[state], { expires: 365 });
    }
    if (updates.accepted !== undefined) {
        cookiesAccepted = updates.accepted;
        if (cookiesAccepted) {
            Cookies.set("accepted", "true", { expires: 365 });
            Cookies.set("version", `${VERSION_MAJOR}.${VERSION_MINOR}`, { expires: 365 });
        }
        else {
            for (let [key] of Object.entries(Cookies.get())) {
                Cookies.remove(key);
            }
        }
        cookiePopup = false;
    }
    if (updates.intensityStats !== undefined) {
        if (cookiesAccepted) Cookies.set("intensityStats", updates.intensityStats, { expires: 365 });
    }
    if (updates.userVowels !== undefined) {
        if (cookiesAccepted) Cookies.set("userVowels", updates.userVowels, { expires: 365 });
    }
    if (constructNewView) {
        if (cookiePopup) view = new CookieView(onStateChange);
        else if (state === STATES.PRESET_SELECTION) view = new PresetView(onStateChange);
        else view = new RecordingView(onStateChange, state, preset);
    }
}

const SAVEABLE_STATES = [
    STATES.PRESET_SELECTION,
    STATES.NO_SAMPLES_YET,
    STATES.SPEECH_MEASURED,
    // STATES.DONE
]

function stateSaveable(state) {
    return SAVEABLE_STATES.includes(state);
}

onStateChange();
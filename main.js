import { CookieView } from './view/CookieView.js';
import { PresetView } from './view/PresetView.js';
import { RecordingView } from './view/RecordingView.js';

import { STATES, STATE_NAMES } from './definitions/states.js';
import { PRESETS, PRESET_NAMES } from './definitions/presets.js';

let cookiesAccepted = Cookies.get("accepted") === "true";
let preset = Cookies.get("preset");
let cookiePopup = !cookiesAccepted;
let state = STATES[Cookies.get("state")];
if (state === undefined || preset === undefined) state = STATES.PRESET_SELECTION;
let view = null;

async function onStateChange(updates = {}) {
    if (updates.newState !== undefined) {
        state = updates.newState;
        if (cookiesAccepted) Cookies.set("state", STATE_NAMES[state], { expires: 365 });
    }
    if (updates.preset !== undefined) {
        preset = updates.preset;
        if (cookiesAccepted) Cookies.set("preset", PRESET_NAMES[preset], { expires: 365 });
        state = STATES.NO_SAMPLES_YET;
    }
    if (updates.accepted !== undefined) {
        cookiesAccepted = updates.accepted;
        if (cookiesAccepted) Cookies.set("accepted", "true", { expires: 365 });
        else {
            for (let [key, val] of Object.entries(Cookies.get())) {
                Cookies.remove(key);
            }
        }
        cookiePopup = false;
    }
    if (cookiePopup) view = new CookieView(onStateChange);
    else if (state === STATES.PRESET_SELECTION) view = new PresetView(onStateChange);
    else view = new RecordingView(onStateChange, state, preset);
}

onStateChange();
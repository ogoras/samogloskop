import ConsentView from './view/ConsentView.js';
import PresetView from './view/PresetView.js';
import RecordingView from './view/RecordingView.js';

import AudioRecorder from './recording/Recorder.js';
import Vowels from './data/vowels/Vowels.js';
import ForeignRecordings from './data/recordings/ForeignRecordings.js';

import soundToFormant from './praat/formant.js';
import IntensityStats from './data/IntensityStats.js';
import Buffer from './util/Buffer.js';
import SpeakerVowels from './data/vowels/SpeakerVowels.js';

import { STATES, STATE_NAMES } from './const/states.js';
import { PRESETS, PRESET_NAMES, PRESET_FREQUENCIES } from './const/presets.js';
import { POINT_SIZES } from './const/POINT_SIZES.js';
import { VERSION_MAJOR, VERSION_MINOR, PATCH } from './const/version.js';
console.log(`%cSamogłoskop v${VERSION_MAJOR}.${VERSION_MINOR}.${PATCH}`,
     "font-size: 3rem; font-weight: bold;");

const formantCount = 20;
const minimumSmoothingCount = 20;
const statsStep = 0.1;    // 100 ms
const calibrationTime = 10; // 10 s

let formantsBuffer = new Buffer(formantCount);
let time = 0;
let intensityStats = new IntensityStats(calibrationTime, statsStep);
let userVowels = new SpeakerVowels("PL");
let foreignVowelsInital = new SpeakerVowels("EN");
let foreignVowelsFinal = new SpeakerVowels("EN");
let sampleRate, samplesBuffer, smoothedFormantsBuffer, formantsToSave;

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
let intensityStatsString = localStorage.getItem("intensityStats");
if (intensityStatsString === undefined && state > STATES.NO_SAMPLES_YET) {
    state = STATES.NO_SAMPLES_YET;
} 
let view = null, audioRecorder = null;
let petersonBarney = new Vowels("EN", "peterson_barney", () => datasetLoaded(petersonBarney));
let englishRecordings;
ForeignRecordings.create("EN")
    .then(recordings => englishRecordings = recordings);
let datasets = [petersonBarney];

async function onStateChange(updates = {}, constructNewView = true) {
    if (updates.newState !== undefined) {
        if (tempState !== undefined) {
            // console.log(`tempState updated to ${STATE_NAMES[updates.newState]}`);
            tempState = updates.newState;
            if (stateSaveable(tempState)) {
                constructNewView = state !== tempState;
                tempState = undefined;
                if (constructNewView) audioRecorder.stopRecording();
            }
        } else {
            // console.log(`state updated to ${STATE_NAMES[updates.newState]}`);
            state = updates.newState;
            if (dataConsentGiven && stateSaveable(state)) {
                localStorage.setItem("state", STATE_NAMES[state]);
            }
            if (MANUALLY_STARTED_STATES.includes(state)) {
                view.updateView({state, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
                // for (let dataset of datasets) {
                //     if (dataset.initialized) view.addDataset(dataset);
                // }
            }
            if (state === STATES.INITIAL_FOREIGN) {
                view.initializeRecordings(englishRecordings);
            }
        }
    }
    if (updates.tempState !== undefined) {
        tempState = updates.tempState;
        view?.updateView?.({state: tempState, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
    }
    if (updates.preset !== undefined) {
        preset = updates.preset;
        if (dataConsentGiven) localStorage.setItem("preset", PRESET_NAMES[preset]);
        if (state === STATES.PRESET_SELECTION) state = STATES.NO_SAMPLES_YET;
        if (dataConsentGiven) localStorage.setItem("state", STATE_NAMES[state]);
    }
    if (updates.accepted !== undefined) {
        dataConsentGiven = updates.accepted;
        if (dataConsentGiven) {
            localStorage.setItem("accepted", "true");
            localStorage.setItem("state", STATE_NAMES[findGreatestSaveableState(state)]);
            localStorage.setItem("version", `${VERSION_MAJOR}.${VERSION_MINOR}`);
            if (preset) localStorage.setItem("preset", PRESET_NAMES[preset]);
            if (state >= STATES.SPEECH_MEASURED) {
                localStorage.setItem("intensityStats", intensityStats.toString());
            }
            if (state >= STATES.CONFIRM_VOWELS) {
                localStorage.setItem("userVowels", userVowels.toString());
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
    if (updates.disableMic !== undefined) {
        if (updates.disableMic) {
            audioRecorder.stopRecording();
            audioRecorder.dump();
            view.disabled = true;
        } else {
            view.disabled = false;
        }
    }
    if (constructNewView) {
        let viewState = tempState ?? state;
        if (consentPopup) view = new ConsentView(onStateChange);
        else if (viewState === STATES.PRESET_SELECTION) view = new PresetView(onStateChange);
        else {
            audioRecorder = new AudioRecorder();
            view = new RecordingView(onStateChange, audioRecorder);
            sampleRate = audioRecorder.sampleRate;
            samplesBuffer = new Buffer(sampleRate / 20);
            if (state >= STATES.SPEECH_MEASURED) {
                intensityStats = IntensityStats.fromString(localStorage.getItem("intensityStats"));
            }
            if (state >= STATES.CONFIRM_VOWELS) {
                userVowels = SpeakerVowels.fromString(localStorage.getItem("userVowels"));
            }
            view.updateView({state: viewState, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
            audioRecorder.onStart = () => {
                samplesBuffer.clear();
                formantsBuffer.clear();
                // view.recordingStarted();
            };
            audioRecorder.onStop = () => {
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

    let updates = {};
    {
        if (viewState === STATES.NO_SAMPLES_YET) {
            updates.newState = viewState = STATES.GATHERING_SILENCE;
        }
        samplesBuffer.pushMultiple(samples);
        const formants = soundToFormant(samplesBuffer.getCopy(), sampleRate, PRESET_FREQUENCIES[preset]);
        for (let formant of formants) {
            formantsBuffer.push({
                F1: formant.formant.length >= 1 ? formant.formant[0].frequency : null,
                F2: formant.formant.length >= 2 ? formant.formant[1].frequency : null,
                endTime: time,
                length: samplesBuffer.length,
                intensity: formant.intensity
            });
        }
        time += samples.length / sampleRate;
        switch (viewState) {
            case STATES.GATHERING_SILENCE:
                updates.progressTime = time;
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    updates.intensityStats = intensityStats;
                    formantsBuffer.clear();
                }
                if (intensityStats.isCalibrationFinished(time)) {
                    updates.newState = viewState = STATES.WAITING_FOR_SPEECH;
                    intensityStats.saveStats("silence");
                }
                break;
            case STATES.WAITING_FOR_SPEECH:
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer) 
                    && intensityStats.detectSpeech()) {
                    updates.newState = viewState = STATES.MEASURING_SPEECH;
                    updates.startTime = time;
                }
                break;
            case STATES.MEASURING_SPEECH:
                updates.progressTime = time;
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    updates.intensityStats = intensityStats;
                    formantsBuffer.clear();
                }
                if (intensityStats.isCalibrationFinished(time)) {
                    updates.newState = viewState = STATES.SPEECH_MEASURED;
                    intensityStats.saveStats("speech");
                    updates.intensityStatsString = intensityStats.toString();
                    intensityStats.resetStart();
                }
                break;
            case STATES.SPEECH_MEASURED:
                // wait for 2 seconds of silence
                var silenceRequired = 2;
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    let length = intensityStats.silenceDuration;
                    updates.progress = length / silenceRequired;
                    if (intensityStats.silenceDuration >= silenceRequired) {
                        updates.progress = 1;
                        updates.newState = viewState = STATES.WAITING_FOR_VOWELS;
                        smoothedFormantsBuffer = new Buffer(minimumSmoothingCount);
                    }
                }
                break;
            case STATES.WAITING_FOR_VOWELS:
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    if (intensityStats.detectSpeech()) {
                        updates.newState = viewState = STATES.GATHERING_VOWELS;
                        formantsBuffer.clear();
                        smoothedFormantsBuffer ??= new Buffer(minimumSmoothingCount);
                        smoothedFormantsBuffer.clear();
                    }
                }
                break;
            case STATES.GATHERING_VOWELS:
            case STATES.CONFIRM_VOWELS:
            case STATES.TRAINING:
                intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer);
                smoothedFormantsBuffer ??= new Buffer(minimumSmoothingCount);
                if (!intensityStats.detectSpeech()) {
                    formantsBuffer.clear();
                    smoothedFormantsBuffer.clear();
                    if (viewState === STATES.GATHERING_VOWELS) updates.newState = viewState = STATES.WAITING_FOR_VOWELS;
                    break;
                }
                updates.formants = [];
                for (let formant of formants) {
                    if (formant.formant.length >= 2) {
                        let point = {
                            x: formant.formant[1].frequency,
                            y: formant.formant[0].frequency,
                            // color: "#00000044",
                            // size: POINT_SIZES.TRAIL
                        }
                        userVowels.scale(point);
                        updates.formants.push(point);
                    }
                }
                updates.formantsSmoothed = userVowels.scale(getSmoothedFormants());
                if (viewState === STATES.GATHERING_VOWELS) {
                    updates.formantsSaved = formantsToSave;
                    userVowels.addFormants(formantsToSave);
                    formantsToSave = undefined;
                    if (userVowels.isVowelGathered()) {
                        updates.vowel = userVowels.saveVowel();
                        if (userVowels.isDone()) {
                            updates.newState = viewState = STATES.CONFIRM_VOWELS;
                            userVowels.scaleLobanov();
                            updates.userVowelsString = userVowels.toString();
                        } else {
                            updates.newState = viewState = STATES.VOWEL_GATHERED;
                        }
                    }
                }
                break;
            case STATES.VOWEL_GATHERED:
                // wait for 1 second of silence
                var silenceRequired = 1;
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    let length = intensityStats.silenceDuration;
                    updates.progress = length / silenceRequired;
                    if (intensityStats.silenceDuration >= silenceRequired) {
                        updates.progress = 1;
                        updates.newState = viewState = STATES.WAITING_FOR_VOWELS;
                        smoothedFormantsBuffer.clear();
                    }
                }
                break;
            default:
                throw new Error("Unknown viewState: " + STATE_NAMES[viewState] ?? viewState);
        }
    }

    view.feed(samples, updates, viewState < STATES.CONFIRM_VOWELS);

    let newState = updates.newState;
    if (newState !== undefined) {
        onStateChange({ 
            newState,
            intensityStats: updates.intensityStatsString,
            userVowels: updates.userVowelsString
        }, false);
        viewState = tempState ?? state;
        view.updateView({state: viewState, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
        if (viewState === STATES.TRAINING) {
            for (let dataset of datasets) {
                if (dataset.initialized) view.addDataset(dataset);
            }
        }
    }

    requestAnimationFrame(renderLoop);
}

function datasetLoaded(dataset) {
    let viewState = tempState ?? state;
    if (viewState >= STATES.TRAINING) view?.addDataset(dataset);
}

const SAVEABLE_STATES = [
    STATES.PRESET_SELECTION,
    STATES.NO_SAMPLES_YET,
    STATES.SPEECH_MEASURED,
    STATES.CONFIRM_VOWELS,
    STATES.TRAINING,
]

const MANUALLY_STARTED_STATES = [
    STATES.INITIAL_FOREIGN,
    STATES.REPEAT_FOREIGN
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

function vowelToScatterPlotEntry(vowel) {
    let [key, value] = vowel;
    return {
        label: key,
        x : value.F2,
        y : value.F1,
        color: value.color
    };
}

function getSmoothedFormants() {
    if (formantsBuffer.length < minimumSmoothingCount) return undefined;
    const ratio = 0.5;
    let weightSum = 0;
    let xSum = 0;
    let ySum = 0;
    let weight = 1;
    for (let formants of formantsBuffer.buffer) {
        xSum += formants.F2 * weight;
        ySum += formants.F1 * weight;
        weightSum += weight;
        weight *= ratio;
    }
    let smoothedFormants = {
        x: xSum / weightSum,
        y: ySum / weightSum,
        size: POINT_SIZES.CURRENT,
        //color: !userVowels.isDone() ? userVowels.currentVowel.rgb : "black"
    };
    formantsToSave = smoothedFormantsBuffer.push(smoothedFormants)
    if (formantsToSave) formantsToSave.size = POINT_SIZES.USER_DATAPOINTS;
    return smoothedFormants;
}

onStateChange();
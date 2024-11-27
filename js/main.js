import ConsentView from './view/ConsentView.js';
import PresetView from './view/PresetView.js';
import RecordingView from './view/RecordingView.js';

import AudioRecorder from './logic/recording/Recorder.js';
import Vowels from './data/vowels/Vowels.js';
import ForeignRecordings from './data/recordings/ForeignRecordings.js';

import soundToFormant from './logic/praat/formant.js';
import IntensityStats from './data/IntensityStats.js';
import Buffer from './logic/util/Buffer.js';
import SpeakerVowels from './data/vowels/SpeakerVowels.js';
import LocalStorageMediator from './data/LocalStorageMediator.js';

import getState from './const/states.js';
import getPreset from './const/presets.js';
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

let localStorageMediator = LocalStorageMediator.getInstance();
localStorageMediator.load();
let consentPopup = !localStorageMediator.dataConsentGiven;

let state = localStorageMediator.state, tempState;
let preset = localStorageMediator.preset;

if (state === undefined || preset === undefined) state = getState("PRESET_SELECTION");
if (localStorageMediator.intensityStatsString === undefined && state.after("NO_SAMPLES_YET")) {
    state = getState("NO_SAMPLES_YET");
} 

let view = null, audioRecorder = null;
let petersonBarney = new Vowels("EN", "peterson_barney", () => datasetLoaded(petersonBarney));
let englishRecordings;
ForeignRecordings.create("EN").then(recordings => englishRecordings = recordings);
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
                localStorageMediator.state = state;
            }
            if (MANUALLY_STARTED_STATES.includes(state)) {
                view.updateView({state, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
                // for (let dataset of datasets) {
                //     if (dataset.initialized) view.addDataset(dataset);
                // }
            }
            if (state.is("INITIAL_FOREIGN")) {
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
        if (dataConsentGiven) localStorageMediator.preset = preset;
        if (state.is("PRESET_SELECTION")) state = getState("NO_SAMPLES_YET");
        if (dataConsentGiven) localStorageMediator.state = state;
    }
    if (updates.accepted !== undefined) {
        dataConsentGiven = updates.accepted;
        if (dataConsentGiven) {
            localStorageMediator.dataConsentGiven = true;
            localStorageMediator.state = findGreatestSaveableState(state);
            localStorageMediator.version = `${VERSION_MAJOR}.${VERSION_MINOR}`;
            if (preset) localStorageMediator.preset = preset;
            if (state.afterOrEqual("SPEECH_MEASURED")) {
                localStorageMediator.intensityStatsString = intensityStats.toString();
            }
            if (state.afterOrEqual("CONFIRM_VOWELS")) {
                localStorageMediator.userVowelsString = userVowels.toString();
            }
        }
        else {
            localStorageMediator.clear();
        }
        consentPopup = false;
    }
    if (updates.intensityStats !== undefined) {
        if (dataConsentGiven) localStorageMediator.intensityStatsString = updates.intensityStats;
    }
    if (updates.userVowels !== undefined) {
        if (dataConsentGiven) localStorageMediator.userVowelsString = updates.userVowels;
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
        else if (viewState.is("PRESET_SELECTION")) view = new PresetView(onStateChange);
        else {
            audioRecorder = new AudioRecorder();
            view = new RecordingView(onStateChange, audioRecorder);
            sampleRate = audioRecorder.sampleRate;
            samplesBuffer = new Buffer(sampleRate / 20);
            if (state.afterOrEqual("SPEECH_MEASURED")) {
                intensityStats = IntensityStats.fromString(localStorageMediator.intensityStatsString);
            }
            if (state.afterOrEqual("CONFIRM_VOWELS")) {
                userVowels = SpeakerVowels.fromString(localStorageMediator.userVowelsString);
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
        if (viewState.is("NO_SAMPLES_YET")) {
            updates.newState = viewState = getState("GATHERING_SILENCE");
        }
        samplesBuffer.pushMultiple(samples);
        const formants = soundToFormant(samplesBuffer.getCopy(), sampleRate, preset.frequency);
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
            case getState("GATHERING_SILENCE"):
                updates.progressTime = time;
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    updates.intensityStats = intensityStats;
                    formantsBuffer.clear();
                }
                if (intensityStats.isCalibrationFinished(time)) {
                    updates.newState = viewState = getState("WAITING_FOR_SPEECH");
                    intensityStats.saveStats("silence");
                }
                break;
            case getState("WAITING_FOR_SPEECH"):
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer) 
                    && intensityStats.detectSpeech()) {
                    updates.newState = viewState = getState("MEASURING_SPEECH");
                    updates.startTime = time;
                }
                break;
            case getState("MEASURING_SPEECH"):
                updates.progressTime = time;
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    updates.intensityStats = intensityStats;
                    formantsBuffer.clear();
                }
                if (intensityStats.isCalibrationFinished(time)) {
                    updates.newState = viewState = getState("SPEECH_MEASURED");
                    intensityStats.saveStats("speech");
                    updates.intensityStatsString = intensityStats.toString();
                    intensityStats.resetStart();
                }
                break;
            case getState("SPEECH_MEASURED"):
                // wait for 2 seconds of silence
                var silenceRequired = 2;
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    let length = intensityStats.silenceDuration;
                    updates.progress = length / silenceRequired;
                    if (intensityStats.silenceDuration >= silenceRequired) {
                        updates.progress = 1;
                        updates.newState = viewState = getState("WAITING_FOR_VOWELS");
                        smoothedFormantsBuffer = new Buffer(minimumSmoothingCount);
                    }
                }
                break;
            case getState("WAITING_FOR_VOWELS"):
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    if (intensityStats.detectSpeech()) {
                        updates.newState = viewState = getState("GATHERING_VOWELS");
                        formantsBuffer.clear();
                        smoothedFormantsBuffer ??= new Buffer(minimumSmoothingCount);
                        smoothedFormantsBuffer.clear();
                    }
                }
                break;
            case getState("GATHERING_VOWELS"):
            case getState("CONFIRM_VOWELS"):
            case getState("TRAINING"):
                intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer);
                smoothedFormantsBuffer ??= new Buffer(minimumSmoothingCount);
                if (!intensityStats.detectSpeech()) {
                    formantsBuffer.clear();
                    smoothedFormantsBuffer.clear();
                    if (viewState.is("GATHERING_VOWELS")) updates.newState = viewState = getState("WAITING_FOR_VOWELS");
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
                if (viewState.is("GATHERING_VOWELS")) {
                    updates.formantsSaved = formantsToSave;
                    userVowels.addFormants(formantsToSave);
                    formantsToSave = undefined;
                    if (userVowels.isVowelGathered()) {
                        updates.vowel = userVowels.saveVowel();
                        if (userVowels.isDone()) {
                            updates.newState = viewState = getState("CONFIRM_VOWELS");
                            userVowels.scaleLobanov();
                            updates.userVowelsString = userVowels.toString();
                        } else {
                            updates.newState = viewState = getState("VOWEL_GATHERED");
                        }
                    }
                }
                break;
            case getState("VOWEL_GATHERED"):
                // wait for 1 second of silence
                var silenceRequired = 1;
                if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
                    let length = intensityStats.silenceDuration;
                    updates.progress = length / silenceRequired;
                    if (intensityStats.silenceDuration >= silenceRequired) {
                        updates.progress = 1;
                        updates.newState = viewState = getState("WAITING_FOR_VOWELS");
                        smoothedFormantsBuffer.clear();
                    }
                }
                break;
            default:
                throw new Error("Unknown viewState: " + viewState);
        }
    }

    view.feed(samples, updates, viewState.before("CONFIRM_VOWELS"));

    let newState = updates.newState;
    if (newState !== undefined) {
        onStateChange({ 
            newState,
            intensityStats: updates.intensityStatsString,
            userVowels: updates.userVowelsString
        }, false);
        viewState = tempState ?? state;
        view.updateView({state: viewState, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
        if (viewState.is("TRAINING")) {
            for (let dataset of datasets) {
                if (dataset.initialized) view.addDataset(dataset);
            }
        }
    }

    requestAnimationFrame(renderLoop);
}

function datasetLoaded(dataset) {
    let viewState = tempState ?? state;
    if (viewState.afterOrEqual("TRAINING")) view?.addDataset(dataset);
}

const SAVEABLE_STATES = [
    "PRESET_SELECTION",
    "NO_SAMPLES_YET",
    "SPEECH_MEASURED",
    "CONFIRM_VOWELS",
    "TRAINING",
].map(getState);

const MANUALLY_STARTED_STATES = [
    "INITIAL_FOREIGN",
    "REPEAT_FOREIGN"
].map(getState);

function stateSaveable(state) {
    return SAVEABLE_STATES.includes(state);
}

function findGreatestSaveableState(state) {
    if (state.before(SAVEABLE_STATES[0])) {
        return SAVEABLE_STATES[0];
    }
    for (let i = 0; i < SAVEABLE_STATES.length - 1; i++) {
        if (SAVEABLE_STATES[i].beforeOrEqual(state) && SAVEABLE_STATES[i+1].after(state)) {
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
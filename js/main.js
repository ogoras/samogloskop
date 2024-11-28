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
import StateMachine from './logic/StateMachine.js';
import proceedToController from './logic/controller/proceedToController.js';

import State from './const/states.js';
import { POINT_SIZES } from './const/POINT_SIZES.js';
import { VERSION_MAJOR, VERSION_MINOR, PATCH } from './const/version.js';
console.log(`%cSamogłoskop v${VERSION_MAJOR}.${VERSION_MINOR}.${PATCH}`,
     "font-size: 3rem; font-weight: bold;");

// const minimumSmoothingCount = 20;

// let time = 0;
// let foreignVowelsInital = new SpeakerVowels("EN");
// let foreignVowelsFinal = new SpeakerVowels("EN");
// let sampleRate, samplesBuffer, smoothedFormantsBuffer, formantsToSave;

let lsm = LocalStorageMediator.getInstance();
lsm.load();

let sm = StateMachine.getInstance();
sm.state = lsm.state;
sm.lsm = lsm;

// let view = null, audioRecorder = null;
// let petersonBarney = new Vowels("EN", "peterson_barney", () => datasetLoaded(petersonBarney));
// let englishRecordings;
// ForeignRecordings.create("EN").then(recordings => englishRecordings = recordings);
// let datasets = [petersonBarney];

proceedToController({sm, lsm});

// async function onStateChange(updates = {}, constructNewView = true) {
//     if (updates.advanceState) {
//         let tempState = sm.advance();
//         if (tempState !== undefined) {
//             constructNewView = sm.state !== tempState;
//             if (constructNewView) audioRecorder.stopRecording();
//         }
//             // if (MANUALLY_STARTED_STATES.includes(state)) {
//             //     view.updateView({state, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
//             //     // for (let dataset of datasets) {
//             //     //     if (dataset.initialized) view.addDataset(dataset);
//             //     // }
//             // }
//             // if (state.is("INITIAL_FOREIGN")) {
//             //     view.initializeRecordings(englishRecordings);
//             // }
//     }
//     if (updates.tempState !== undefined) {
//         tempState = updates.tempState;
//         view?.updateView?.({state: tempState, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
//     }
//     if (updates.preset !== undefined) {
//         preset = updates.preset;
//         if (dataConsentGiven) lsm.preset = preset;
//         if (state.is("PRESET_SELECTION")) state = State.get("NO_SAMPLES_YET");
//         if (dataConsentGiven) lsm.state = state;
//     }
//     if (updates.accepted !== undefined) {
//         dataConsentGiven = updates.accepted;
//         if (dataConsentGiven) {
//             lsm.dataConsentGiven = true;
//             lsm.state = findGreatestSaveableState(state);
//             lsm.version = `${VERSION_MAJOR}.${VERSION_MINOR}`;
//             if (preset) lsm.preset = preset;
//             if (state.afterOrEqual("SPEECH_MEASURED")) {
//                 lsm.intensityStatsString = intensityStats.toString();
//             }
//             if (state.afterOrEqual("CONFIRM_VOWELS")) {
//                 lsm.userVowelsString = userVowels.toString();
//             }
//         }
//         else {
//             lsm.clear();
//         }
//         consentPopup = false;
//     }
//     if (updates.intensityStats !== undefined) {
//         if (dataConsentGiven) lsm.intensityStatsString = updates.intensityStats;
//     }
//     if (updates.userVowels !== undefined) {
//         if (dataConsentGiven) lsm.userVowelsString = updates.userVowels;
//     }
//     if (updates.disableMic !== undefined) {
//         if (updates.disableMic) {
//             audioRecorder.stopRecording();
//             audioRecorder.dump();
//             view.disabled = true;
//         } else {
//             view.disabled = false;
//         }
//     }
//     if (constructNewView) {
//         if (consentPopup) view = new ConsentView(onStateChange);
//         else if (sm.state.is("PRESET_SELECTION")) view = new PresetView(onStateChange);
//         else {
//             audioRecorder = new AudioRecorder();
//             view = new RecordingView(onStateChange, audioRecorder);
//             sampleRate = audioRecorder.sampleRate;
//             samplesBuffer = new Buffer(sampleRate / 20);
//             if (sm.state.afterOrEqual("SPEECH_MEASURED")) {
//                 intensityStats = IntensityStats.fromString(lsm.intensityStatsString);
//             }
//             if (sm.state.afterOrEqual("CONFIRM_VOWELS")) {
//                 userVowels = SpeakerVowels.fromString(lsm.userVowelsString);
//             }
//             view.updateView({state: sm.state, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
//             audioRecorder.onStart = () => {
//                 samplesBuffer.clear();
//                 formantsBuffer.clear();
//                 // view.recordingStarted();
//             };
//             audioRecorder.onStop = () => {
//                 // view.recordingStopped();
//             };
//             renderLoop();
//         }
//     }
// }

// function renderLoop() {
//     let viewState = tempState ?? state;

//     if (audioRecorder.samplesCollected < 8) {
//         requestAnimationFrame(renderLoop);
//         return;
//     }

//     const samples = audioRecorder.dump();

//     let updates = {};
//     {
//         if (viewState.is("NO_SAMPLES_YET")) {
//             updates.newState = viewState = State.get("GATHERING_SILENCE");
//         }
//         samplesBuffer.pushMultiple(samples);
//         const formants = soundToFormant(samplesBuffer.getCopy(), sampleRate, preset.frequency);
//         for (let formant of formants) {
//             formantsBuffer.push({
//                 F1: formant.formant.length >= 1 ? formant.formant[0].frequency : null,
//                 F2: formant.formant.length >= 2 ? formant.formant[1].frequency : null,
//                 endTime: time,
//                 length: samplesBuffer.length,
//                 intensity: formant.intensity
//             });
//         }
//         time += samples.length / sampleRate;
//         switch (viewState) {
//             case State.get("GATHERING_SILENCE"):
//                 updates.progressTime = time;
//                 if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
//                     updates.intensityStats = intensityStats;
//                     formantsBuffer.clear();
//                 }
//                 if (intensityStats.isCalibrationFinished(time)) {
//                     updates.newState = viewState = State.get("WAITING_FOR_SPEECH");
//                     intensityStats.saveStats("silence");
//                 }
//                 break;
//             case State.get("WAITING_FOR_SPEECH"):
//                 if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer) 
//                     && intensityStats.detectSpeech()) {
//                     updates.newState = viewState = State.get("MEASURING_SPEECH");
//                     updates.startTime = time;
//                 }
//                 break;
//             case State.get("MEASURING_SPEECH"):
//                 updates.progressTime = time;
//                 if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
//                     updates.intensityStats = intensityStats;
//                     formantsBuffer.clear();
//                 }
//                 if (intensityStats.isCalibrationFinished(time)) {
//                     updates.newState = viewState = State.get("SPEECH_MEASURED");
//                     intensityStats.saveStats("speech");
//                     updates.intensityStatsString = intensityStats.toString();
//                     intensityStats.resetStart();
//                 }
//                 break;
//             case State.get("SPEECH_MEASURED"):
//                 // wait for 2 seconds of silence
//                 var silenceRequired = 2;
//                 if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
//                     let length = intensityStats.silenceDuration;
//                     updates.progress = length / silenceRequired;
//                     if (intensityStats.silenceDuration >= silenceRequired) {
//                         updates.progress = 1;
//                         updates.newState = viewState = State.get("WAITING_FOR_VOWELS");
//                         smoothedFormantsBuffer = new Buffer(minimumSmoothingCount);
//                     }
//                 }
//                 break;
//             case State.get("WAITING_FOR_VOWELS"):
//                 if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
//                     if (intensityStats.detectSpeech()) {
//                         updates.newState = viewState = State.get("GATHERING_VOWELS");
//                         formantsBuffer.clear();
//                         smoothedFormantsBuffer ??= new Buffer(minimumSmoothingCount);
//                         smoothedFormantsBuffer.clear();
//                     }
//                 }
//                 break;
//             case State.get("GATHERING_VOWELS"):
//             case State.get("CONFIRM_VOWELS"):
//             case State.get("TRAINING"):
//                 intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer);
//                 smoothedFormantsBuffer ??= new Buffer(minimumSmoothingCount);
//                 if (!intensityStats.detectSpeech()) {
//                     formantsBuffer.clear();
//                     smoothedFormantsBuffer.clear();
//                     if (viewState.is("GATHERING_VOWELS")) updates.newState = viewState = State.get("WAITING_FOR_VOWELS");
//                     break;
//                 }
//                 updates.formants = [];
//                 for (let formant of formants) {
//                     if (formant.formant.length >= 2) {
//                         let point = {
//                             x: formant.formant[1].frequency,
//                             y: formant.formant[0].frequency,
//                             // color: "#00000044",
//                             // size: POINT_SIZES.TRAIL
//                         }
//                         userVowels.scale(point);
//                         updates.formants.push(point);
//                     }
//                 }
//                 updates.formantsSmoothed = userVowels.scale(getSmoothedFormants());
//                 if (viewState.is("GATHERING_VOWELS")) {
//                     updates.formantsSaved = formantsToSave;
//                     userVowels.addFormants(formantsToSave);
//                     formantsToSave = undefined;
//                     if (userVowels.isVowelGathered()) {
//                         updates.vowel = userVowels.saveVowel();
//                         if (userVowels.isDone()) {
//                             updates.newState = viewState = State.get("CONFIRM_VOWELS");
//                             userVowels.scaleLobanov();
//                             updates.userVowelsString = userVowels.toString();
//                         } else {
//                             updates.newState = viewState = State.get("VOWEL_GATHERED");
//                         }
//                     }
//                 }
//                 break;
//             case State.get("VOWEL_GATHERED"):
//                 // wait for 1 second of silence
//                 var silenceRequired = 1;
//                 if (intensityStats.update(time, formantsBuffer.buffer, samplesBuffer.buffer)) {
//                     let length = intensityStats.silenceDuration;
//                     updates.progress = length / silenceRequired;
//                     if (intensityStats.silenceDuration >= silenceRequired) {
//                         updates.progress = 1;
//                         updates.newState = viewState = State.get("WAITING_FOR_VOWELS");
//                         smoothedFormantsBuffer.clear();
//                     }
//                 }
//                 break;
//             default:
//                 throw new Error("Unknown viewState: " + viewState);
//         }
//     }

//     view.feed(samples, updates, viewState.before("CONFIRM_VOWELS"));

//     let newState = updates.newState;
//     if (newState !== undefined) {
//         onStateChange({ 
//             newState,
//             intensityStats: updates.intensityStatsString,
//             userVowels: updates.userVowelsString
//         }, false);
//         viewState = tempState ?? state;
//         view.updateView({state: viewState, preset, userVowels, foreignVowelsInital, foreignVowelsFinal, calibrationTime, formantCount, intensityStats});
//         if (viewState.is("TRAINING")) {
//             for (let dataset of datasets) {
//                 if (dataset.initialized) view.addDataset(dataset);
//             }
//         }
//     }

//     requestAnimationFrame(renderLoop);
// }

// function datasetLoaded(dataset) {
//     if (sm.state.afterOrEqual("TRAINING")) view?.addDataset(dataset);
// }

// function getSmoothedFormants() {
//     if (formantsBuffer.length < minimumSmoothingCount) return undefined;
//     const ratio = 0.5;
//     let weightSum = 0;
//     let xSum = 0;
//     let ySum = 0;
//     let weight = 1;
//     for (let formants of formantsBuffer.buffer) {
//         xSum += formants.F2 * weight;
//         ySum += formants.F1 * weight;
//         weightSum += weight;
//         weight *= ratio;
//     }
//     let smoothedFormants = {
//         x: xSum / weightSum,
//         y: ySum / weightSum,
//         size: POINT_SIZES.CURRENT,
//         //color: !userVowels.isDone() ? userVowels.currentVowel.rgb : "black"
//     };
//     formantsToSave = smoothedFormantsBuffer.push(smoothedFormants)
//     if (formantsToSave) formantsToSave.size = POINT_SIZES.USER_DATAPOINTS;
//     return smoothedFormants;
// }

// onStateChange();
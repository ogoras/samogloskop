import { View } from './View.js';
import { AudioRecorder } from '../recording/Recorder.js';
import { FormantProcessor } from '../data/FormantProcessor.js';
import { WaveformVisualizer } from '../visualization/waveform/WaveformVisualizer.js';
import { STATES, STATE_NAMES } from '../const/states.js';
import { FORMANT_VIEWS } from './formant_view/FORMANT_VIEWS.js';

export class RecordingView extends View {
    constructor(onStateChange, state, preset) {
        super(onStateChange);

        this.state = state;

        // add a div before the main container
        let formantsContainer = this.formantsContainer = document.createElement("div");
        formantsContainer.classList.add("formants-container");
        formantsContainer.id = "formants";
        document.body.insertBefore(formantsContainer, this.mainContainer);
        let centerDiv = document.createElement("div");
        centerDiv.classList.add("center");
        formantsContainer.appendChild(centerDiv);
        let stackDiv = document.createElement("div");
        stackDiv.classList.add("stack");
        centerDiv.appendChild(stackDiv);

        let recordingContainer = document.createElement("div");
        recordingContainer.classList.add("recording-container");
        this.mainContainer.appendChild(recordingContainer);
        let recordButton = document.createElement("div");
        recordButton.classList.add("record-button");
        recordButton.innerHTML = "🎙️";
        recordingContainer.appendChild(recordButton);
        let recordingIndicator = document.createElement("div");
        recordingIndicator.classList.add("recording-indicator");
        recordingContainer.appendChild(recordingIndicator);
        let hint = document.createElement("div");
        hint.classList.add("record-press-me");
        hint.innerHTML = `<h5><b>←</b></h5>
            <p class="gray">Naciśnij przycisk, żeby włączyć nasłuchiwanie</p>`;
        recordingContainer.appendChild(hint);

        let canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 100;
        canvas.classList.add("visualizer");
        canvas.classList.add("fl");
        this.mainContainer.appendChild(canvas);

        if (localStorage.getItem("accepted") === "true") {
            let localStorageInfo = document.createElement("div");
            this.mainContainer.appendChild(localStorageInfo);
            let p = document.createElement("p");
            p.innerHTML = `Zaakceptowano przechowywanie danych w pamięci lokalnej.
                Po wycofaniu zgody aplikacja będzie pamiętać dane tylko do końca sesji lub odświeżenia strony.`;
            localStorageInfo.appendChild(p);
            let button = document.createElement("button");
            button.innerHTML = "Wycofaj zgodę i wyczyść dane z pamięci lokalnej";
            button.addEventListener("click", () => {
                this.onStateChange({ accepted: false }, false);
                localStorageInfo.remove();
            });
            localStorageInfo.appendChild(button);
        }

        this.audioRecorder = new AudioRecorder();
        this.formantProcessor = new FormantProcessor(this.audioRecorder.sampleRate, state, preset);
        this.waveformVisualizer = new WaveformVisualizer();
        this.audioRecorder.onStart = () => {
            this.formantProcessor.recordingStarted();
            if (this.view) this.view.recordingStarted();
            this.waveformVisualizer.reset();
        };

        this.audioRecorder.onStop = () => {
            if (this.view) this.formantProcessor.recordingStopped();
            this.view.recordingStopped();
        }

        this.updateView(state);
        this.draw();
    }
    
    updateView(state) {
        let Constructor = FORMANT_VIEWS[state];
        if (Constructor) {
            if (this.view) {
                if (Constructor !== this.view.constructor) {
                    this.view = new Constructor(this.view, this.formantProcessor);
                }
                else switch(state) {
                    case STATES.SPEECH_MEASURED:
                        this.view.finish();
                        break;
                    case STATES.MEASURING_SPEECH:
                    case STATES.GATHERING_VOWELS:
                        this.view.speechDetected = true;
                        break;
                    case STATES.WAITING_FOR_VOWELS:
                        this.view.speechDetected = false;
                        break;
                    case STATES.VOWEL_GATHERED:
                        this.view.vowelGathered = true;
                        break;
                }
            }
            else this.view = new Constructor(this.formantsContainer, this.formantProcessor, state);
        }
    }

    draw() {
        if (this.audioRecorder.samplesCollected < WaveformVisualizer.bufferLength / 128) {
            requestAnimationFrame(this.draw.bind(this));
            return;
        }

        const samples = this.audioRecorder.dump();

        let updates = this.formantProcessor.feed(samples);

        let intensityStats = updates.intensityStats;
        if (intensityStats) this.view.update(intensityStats);

        let formants = updates.formants;
        if (formants) this.view.feed(formants, this.state < STATES.DONE);
        let formantsSmoothed = updates.formantsSmoothed;
        if (formantsSmoothed) this.view.feedSmoothed(formantsSmoothed, this.state < STATES.DONE);
        let formantsSaved = updates.formantsSaved;
        if (formantsSaved) this.view.saveFormants(formantsSaved);

        let vowel = updates.vowel;
        if (vowel) this.view.vowelCentroid(vowel.avg);

        let progressTime = updates.progressTime;
        if (progressTime !== undefined  && this.view.updateProgress) this.view.updateProgress(progressTime);
        let progress = updates.progress;
        if (progress !== undefined && this.view.updateProgress) this.view.updateProgress(progress, false);

        let newState = updates.newState;
        if (newState !== undefined) {
            this.state = newState;
            this.onStateChange({ 
                newState,
                intensityStats: updates.intensityStatsString,
                userVowels: updates.userVowelsString
            }, false);
            this.updateView(newState);
        }

        let startTime = updates.startTime;
        if (startTime !== undefined) this.view.startTime = startTime;

        this.waveformVisualizer.feed(samples);

        requestAnimationFrame(this.draw.bind(this));
    }
}
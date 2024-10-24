import { View } from './View.js';
import { WaveformVisualizer } from '../visualization/waveform/WaveformVisualizer.js';
import { STATES, STATE_NAMES } from '../const/states.js';
import { FORMANT_VIEWS } from './formant_view/FORMANT_VIEWS.js';

const UPDATE_FUNCTION = {
    intensityStats: (t, x) => { t.update?.(x) },
    formants: (t, x, y) => { t.feed?.(x, y) },
    formantsSmoothed: (t, x, y) => { t.feedSmoothed?.(x, y) },
    formantsSaved: (t, x) => { t.saveFormants?.(x) },
    vowel: (t, vowel) => { t.vowelCentroid?.(vowel.avg) },
    progressTime: (t, time) => { t.updateProgress?.(time); },
    progress: (t, progress) => { t.updateProgress?.(progress, false); },
    startTime: (t, time) => { t.startTime = time; },
}

export class RecordingView extends View {
    constructor(onStateChange) {
        super(onStateChange);

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

        this.waveformVisualizer = new WaveformVisualizer();
    }
    
    updateView(state, formantProcessor) {
        let Constructor = FORMANT_VIEWS[state];
        if (Constructor) {
            if (this.view) {
                if (Constructor !== this.view.constructor) {
                    this.view = new Constructor(this.view, formantProcessor);
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
            else this.view = new Constructor(this.formantsContainer, formantProcessor, state);
        }
    }

    feed(samples, updates, rescalePlots) {
        for (let [key, value] of Object.entries(updates)) {
            if (value !== undefined && value !== null) UPDATE_FUNCTION[key]?.(this.view, value, rescalePlots);
        }
        this.waveformVisualizer.feed(samples);
    }

    recordingStarted() {
        if (this.view) this.view.recordingStarted();
        this.waveformVisualizer.reset();
    }

    recordingStopped() {
        if (this.view) this.view.recordingStopped();
    }
}
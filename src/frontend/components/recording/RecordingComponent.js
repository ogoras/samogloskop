import Component from "../Component.js";
import WaveformVisualizer from "../../visualization/waveform/WaveformVisualizer.js";

export default class RecordingComponent extends Component {
    #disabled = false;

    /**
     * @param {boolean} value
     */
    set disabled(value) {
        this.#disabled = value;
        this.recordButton.classList.toggle("disabled", value);
        if (value) this.recordingStopped();
    }

    get disabled() {
        return this.#disabled;
    }

    constructor(parent, recorder) {
        super("recording-container", null, parent);
        const element = this.element;

        if (!recorder) throw new Error("Recorder not given to RecordingComponent");
        this.recorder = recorder;

        async function toggleCallback() {
            if (this.disabled) return;
            switch(await this.recorder.toggleRecording()) {
                case "started":
                    this.recordingStarted();
                    break;
                case "stopped":
                    this.recordingStopped();
                    break;
            }
        }
        
        const recordButton = this.recordButton = document.createElement("div");
        recordButton.classList.add("emoji-button");
        recordButton.classList.add("strikethrough-button");
        recordButton.id = "record-button";
        recordButton.innerHTML = "🎙️";
        recordButton.addEventListener("click", toggleCallback.bind(this));
        element.appendChild(recordButton);

        addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                toggleCallback.bind(this)();
            }
        });

        const recordingIndicator = this.recordingIndicator = document.createElement("div");
        recordingIndicator.classList.add("recording-indicator");
        element.appendChild(recordingIndicator);

        const hint = this.hint = document.createElement("div");
        hint.classList.add("record-press-me");
        hint.innerHTML = `<h5><b>←</b></h5>
            <p class="gray">Naciśnij przycisk, żeby włączyć nasłuchiwanie</p>`;
        element.appendChild(hint);

        const visualizer = document.createElement("div");
        visualizer.classList.add("visualizer");
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 0;
        visualizer.appendChild(canvas);
        element.appendChild(visualizer);
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const settingsButton = document.createElement("div");
        settingsButton.classList.add("emoji-button");
        settingsButton.innerHTML = "⚙️";
        settingsButton.addEventListener("click", () => this.view.openSettings());
        element.appendChild(settingsButton);

        this.waveformVisualizer = new WaveformVisualizer();
    }

    feed(samples) {
        this.waveformVisualizer.feed(samples);
    }

    stopRecording() {
        this.recorder.stopRecording();
        this.recordingStopped();
    }

    destroy() {
        this.recorder.stopRecording();
        super.destroy();
    }

    recordingStarted() {
        this.hint.style.display = "none";
        this.recordButton.classList.add('hide-strikethrough');
        this.recordingIndicator.style.backgroundColor = 'red';
        this.view?.recordingStarted?.();
        this.waveformVisualizer.reset();
    }

    recordingStopped() {
        this.recordButton.classList.remove('hide-strikethrough');
        this.recordingIndicator.style.backgroundColor = '#ff000000';
        this.view?.recordingStopped?.();
    }
}
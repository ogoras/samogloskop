import LocalStorageMediator from "../../model/LocalStorageMediator.js";

export default class AudioRecorder {
    stream = null;
    audioCtx = null; source = null; audioBufferData = []; recorderNode = null;
    initialized = false; recording = false;

    recordingIndicator = document.querySelector('.recording-indicator');
    recordButton = document.querySelector('#record-button');

    #currentlyToggling = false;

    get sampleRate() { 
        return this.audioCtx ? this.audioCtx.sampleRate : null;
    }

    get samplesCollected() {
        return this.audioBufferData ? this.audioBufferData.length : 0;
    }

    constructor() {
        this.audioCtx = new AudioContext();
    }

    async init() {
        this.audioCtx = new AudioContext();
        await this.audioCtx.audioWorklet.addModule('dist/logic/recording/recorder-worklet-processor.js');
    }

    async toggleRecording() {
        if (this.#currentlyToggling) return null;
        this.#currentlyToggling = true;

        try {
            if (this.recording) {
                if (this.stopRecording()) return "stopped";
            } else {
                if (await this.startRecording()) return "started";
            }
        } catch (error) {
            console.log("An error occured in toggleCallback: " + error);
        } finally {
            this.#currentlyToggling = false;
        }
    }

    async startRecording() {
        if (this.recording) return false;
        this.audioBufferData = [];

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: {
                autoGainControl: false,
                noiseSuppression: false,
                echoCancellation: false
            } });
        }
        catch (error) {
            console.log("An error occured: " + error);
        }

        const lsm = LocalStorageMediator.getInstance();
        const deviceLabel = this.stream.getAudioTracks()[0].label;
        if (!lsm.microphoneLabel) {
            lsm.microphoneLabel = deviceLabel;
        } else if (lsm.microphoneLabel !== deviceLabel) {
            // show a popup about incorrect microphone
            if (window.confirm(`Używasz innego mikrofonu niż zapisany. Teraz używasz "${deviceLabel}", a zapisany był "${lsm.microphoneLabel}". Czy jesteś pewien, że jest to to samo urządzenie?`)) {
                lsm.microphoneLabel = deviceLabel;
            } else {
                this.stream.getTracks().forEach(track => track.stop());
                return false;
            }
        }

        if (!this.initialized) {
            await this.init();
            this.initialized = true;
        }
        this.source = this.audioCtx.createMediaStreamSource(this.stream);
        this.recorderNode = new AudioWorkletNode(this.audioCtx, 'recorder-processor');
        this.recorderNode.port.onmessage = (event) => {
            const inputData = event.data;
            this.audioBufferData.push(...inputData);
        };
        this.source.connect(this.recorderNode);
        this.recording = true;
        this.onStart();
        return true;
    }

    stopRecording() {
        if (!this.recording) return false;
        this.source.disconnect();
        this.recorderNode.disconnect();
        this.stream.getTracks().forEach(track => track.stop());
        this.recording = false;
        this.onStop();
        return true;
    }

    dump() {
        const ret = this.audioBufferData;
        this.audioBufferData = [];
        return ret;
    }

    onStop() {}
    onStart() {}
}
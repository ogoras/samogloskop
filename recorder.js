export class AudioRecorder {
    stream = null;
    audioCtx = null; source = null; audioBufferData = []; recorderNode = null;
    initialized = false; recording = false;

    recordingIndicator = document.querySelector('.recording-indicator');
    recordButton = document.querySelector('.record-button');

    get sampleRate() { 
        return this.audioCtx ? this.audioCtx.sampleRate : null;
    }

    get samplesCollected() {
        return this.audioBufferData ? this.audioBufferData.length : 0;
    }

    constructor() {
        let startCallback = this.startRecording.bind(this);
        this.recordButton.addEventListener('mousedown', startCallback);
        this.recordButton.addEventListener('touchstart', startCallback);
        addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                startCallback();
            }
        });
        let stopCallback = this.stopRecording.bind(this);
        this.recordButton.addEventListener('mouseup', stopCallback);
        this.recordButton.addEventListener('touchend', stopCallback);
        addEventListener('keyup', (event) => {
            if (event.code === 'Space') {
                stopCallback();
            }
        });
    }

    async init() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        catch (error) {
            console.log("An error occured: " + error);
        }
        this.audioCtx = new AudioContext();
        this.source = this.audioCtx.createMediaStreamSource(this.stream);
        await this.audioCtx.audioWorklet.addModule('recorder-worklet-processor.js');
        this.recorderNode = new AudioWorkletNode(this.audioCtx, 'recorder-processor');
        this.recorderNode.port.onmessage = (event) => {
            const inputData = event.data;
            this.audioBufferData.push(...inputData);
        };
    }

    async startRecording() {
        let hintElements = document.getElementsByClassName("record-press-me");
        for (let i = 0; i < hintElements.length; i++) {
            hintElements[i].style.display = "none";
        }

        if (this.recording) return;
        this.audioBufferData = [];
        if (!this.initialized) {
            await this.init();
            this.initialized = true;
        }
        // Step 7: Connect the source to the AudioWorkletNode and the node to the destination
        this.source.connect(this.recorderNode);
        this.recordingIndicator.style.backgroundColor = 'red';
        this.recording = true;
    }

    stopRecording() {
        if (!this.recording) return;
        this.source.disconnect();
        this.recordingIndicator.style.backgroundColor = '#ff000000';
        this.recording = false;
    }

    dump() {
        let tmp = this.audioBufferData;
        this.audioBufferData = [];
        return tmp;
    }
}
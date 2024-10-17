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
        function toggleCallback() {
            if (this.recording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        } 
        this.recordButton.addEventListener('mousedown', toggleCallback.bind(this));
        addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                toggleCallback.bind(this)();
            }
        });

        this.audioCtx = new AudioContext();
    }

    async init() {
        this.audioCtx = new AudioContext();
        await this.audioCtx.audioWorklet.addModule('js/recording/recorder-worklet-processor.js');
    }

    async startRecording() {
        let hintElements = document.getElementsByClassName("record-press-me");
        for (let i = 0; i < hintElements.length; i++) {
            hintElements[i].style.display = "none";
        }
        document.querySelector('.record-button').classList.add('hide-strikethrough');

        if (this.recording) return;
        this.audioBufferData = [];

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
        catch (error) {
            console.log("An error occured: " + error);
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
        this.recordingIndicator.style.backgroundColor = 'red';
        this.recording = true;
        this.onStart();
    }

    stopRecording() {
        document.querySelector('.record-button').classList.remove('hide-strikethrough');
        if (!this.recording) return;
        this.source.disconnect();
        this.recorderNode.disconnect();
        this.stream.getTracks().forEach(track => track.stop());
        this.recordingIndicator.style.backgroundColor = '#ff000000';
        this.recording = false;
        this.onStop();
    }

    dump() {
        let tmp = this.audioBufferData;
        this.audioBufferData = [];
        return tmp;
    }

    onStop() {}
    onStart() {}
}
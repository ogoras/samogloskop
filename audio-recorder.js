export var audioRecorder = {
    audioBlobs: [],
    mediaRecorder: null,
    streamBeingCaptured: null,
    blob: null,
    start: function () {
        if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            return Promise.reject(new Error('mediaDevices API or getUserMedia method is not supported in this browser.'));
        }
        else {
            return navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    this.streamBeingCaptured = stream;
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.audioBlobs = [];
                    this.mediaRecorder.addEventListener("dataavailable", event => {
                        this.audioBlobs.push(event.data);
                    });
                    this.mediaRecorder.start();
                })
                .catch(error => {
                    console.log("An error occured with the error name " + error.name);
                });
        }
    },
    stop: function () {
        return new Promise(resolve => {
            let mimeType = this.mediaRecorder.mimeType;
            this.mediaRecorder.addEventListener("stop", () => {
                let audioBlob = new Blob(this.audioBlobs, { type: mimeType });
                resolve(audioBlob);
            });
            this.mediaRecorder.stop();
            this.stopStream();
            this.resetRecordingProperties();
        });
    },
    stopStream: function () {
        this.streamBeingCaptured.getTracks().forEach(track => {
            track.stop();
        });
    },
    resetRecordingProperties: function () {
        this.mediaRecorder = null;
        this.streamBeingCaptured = null;
    },
    cancel: function () {
        this.mediaRecorder.stop();
        this.stopStream();
        this.resetRecordingProperties();
    }
}
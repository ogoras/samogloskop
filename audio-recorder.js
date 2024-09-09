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
                        // concatenate the audio blobs
                        if (!this.blob) this.blob = event.data;
                        else this.blob = new Blob([this.blob, event.data], { type: this.blob.type });
                        requestAnimationFrame(draw);
                    });
                    this.mediaRecorder.start();
                    audioRecorder.mediaRecorder.requestData();
                })
                .catch(error => {
                    console.log("An error occured with the error name " + error.name);
                });
        }
    }
}

// visualizer based on code from https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone/scripts/app.js
var canvas = document.querySelector("canvas");
var canvasCtx = canvas.getContext("2d");
const bufferLength = 1024;
const dataArray = new Float32Array(bufferLength);
var audioCtx = null;

function draw() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    if (audioRecorder.blob.size === 0) {
        audioRecorder.mediaRecorder.requestData();
        return;
    }
    // copy from audioRecorder.audioBlobs[audioRecorder.audioBlobs.length - 1] to dataArray
    console.log("audioRecorder.blob", audioRecorder.blob);
    audioRecorder.blob.arrayBuffer().then(arrayBuffer => {
        audioCtx.decodeAudioData(arrayBuffer).then(buffer => {
            buffer = buffer.getChannelData(0).slice(0, bufferLength);
            dataArray.set(new Float32Array(buffer), 0);
            console.log(dataArray);
            canvasCtx.fillStyle = "rgb(200, 200, 200)";
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = "rgb(0, 0, 0)";

            canvasCtx.beginPath();

            let sliceWidth = (WIDTH * 1.0) / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                let v = dataArray[i];
                let y = (v * HEIGHT) / 2;
                y = HEIGHT - y;

                if (i === 0) {
                canvasCtx.moveTo(x, y);
                } else {
                canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
            audioRecorder.mediaRecorder.requestData();
        });
    });
}
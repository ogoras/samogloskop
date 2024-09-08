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
                    visualize(stream);
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

// visualizer based on code from https://github.com/mdn/dom-examples/blob/main/media/web-dictaphone/scripts/app.js
var canvas = document.querySelector("canvas");
var canvasCtx = canvas.getContext("2d");

function visualize(stream) {
    var audioCtx = new AudioContext();
    console.log("The sample rate is " + audioCtx.sampleRate);
    const source = audioCtx.createMediaStreamSource(stream);

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
  
    source.connect(analyser);
  
    draw();
  
    function draw() {
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
  
      requestAnimationFrame(draw);
  
      analyser.getByteFrequencyData(dataArray);
  
      canvasCtx.fillStyle = "rgb(200, 200, 200)";
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(0, 0, 0)";
  
      canvasCtx.beginPath();
  
      let sliceWidth = (WIDTH * 1.0) / bufferLength;
      let x = 0;
  
      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
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
    }
}
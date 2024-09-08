// Audio recording based on:
// https://ralzohairi.medium.com/audio-recording-in-javascript-96eed45b75ee
import { audioRecorder } from './audio-recorder.js';

var recordButton = document.getElementsByClassName("record-button")[0];
var stopButton = document.getElementsByClassName("stop-button")[0];
var cancelButton = document.getElementsByClassName("cancel-button")[0];
var playButton = document.getElementsByClassName("play-button")[0];
var audioElement = document.getElementsByClassName("audio-element")[0];
var audioElementSource = document.getElementsByClassName("audio-element")[0].getElementsByTagName("source")[0];

recordButton.addEventListener("click", startAudioRecording);
stopButton.addEventListener("click", stopAudioRecording);
cancelButton.addEventListener("click", cancelAudioRecording);
playButton.addEventListener("click", playAudioRecording);

recordButton.style.display = "block";
stopButton.style.display = "none";
cancelButton.style.display = "none";
playButton.style.display = "none";

function startAudioRecording() {
    audioRecorder.start()
        .then(() => {
            console.log("Recording Audio...")    
        })    
        .catch(error => {
            if (error.message.includes("mediaDevices API or getUserMedia method is not supported in this browser.")) {       
                console.log("To record audio, use browsers like Chrome and Firefox.");
                alert("To record audio, use browsers like Chrome and Firefox.");
            }
        });
    // hide record button and show stop button
    recordButton.style.display = "none";
    stopButton.style.display = "block";
    cancelButton.style.display = "block";
    playButton.style.display = "none";
}

function stopAudioRecording() {
    console.log("Stopping Audio Recording...")
    audioRecorder.stop()
        .then(audioAsblob => { 
            console.log("stopped with audio Blob:", audioAsblob);
            playButton.style.display = "block";
            audioRecorder.blob = audioAsblob;
        })
        .catch(error => {
            switch (error.name) {
                case 'InvalidStateError':
                    console.log("An InvalidStateError has occured.");
                    break;
                default:
                    console.log("An error occured with the error name " + error.name);
            };
 
        });
    // hide stop button and show record button
    recordButton.style.display = "block";
    stopButton.style.display = "none";
    cancelButton.style.display = "none";
}

function cancelAudioRecording() {
    console.log("Cancelling Audio Recording...")
    audioRecorder.cancel();
    // hide stop button and show record button
    recordButton.style.display = "block";
    stopButton.style.display = "none";
    cancelButton.style.display = "none";
    playButton.style.display = "none";
}

function playAudioRecording() {
    var recorderAudioAsBlob = audioRecorder.blob;
    let reader = new FileReader();
    reader.onload = (e) => {
        var recorderAudioAsBlob = audioRecorder.blob;
        let base64URL = e.target.result;
        if (!audioElementSource) createSourceForAudioElement();
        audioElementSource.src = base64URL;
        let BlobType = recorderAudioAsBlob.type.includes(";") ?
            recorderAudioAsBlob.type.substr(0, recorderAudioAsBlob.type.indexOf(';')) : recorderAudioAsBlob.type;
        audioElementSource.type = BlobType
        audioElement.load();
        console.log("Playing audio...");
        audioElement.play();
    };
    reader.readAsDataURL(recorderAudioAsBlob);
}

/** Creates a source element for the the audio element in the HTML document*/
function createSourceForAudioElement() {
    let sourceElement = document.createElement("source");
    audioElement.appendChild(sourceElement);

    audioElementSource = sourceElement;
}
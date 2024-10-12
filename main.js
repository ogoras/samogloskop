import { AudioRecorder } from './Recorder.js';
import { FormantVisualizer } from './FormantVisualizer.js';
import { WaveformVisualizer } from './WaveformVisualizer.js';

let formantsContainer = document.querySelector(".formants-container");
let recordingContainer = document.querySelector(".recording-container");
let canvas = document.querySelector("canvas");
let cookieNoticeElement = null;
let cookiesAccepted = Cookies.get("accepted") === "true";

let audioRecorder, formantVisualizer, waveformVisualizer;

if (!cookiesAccepted) {
    for (let element of [formantsContainer, recordingContainer, canvas]) {
        element.style.display = "none";
    }
    // create a new div element with the cookie notice
    cookieNoticeElement = document.createElement("div");
    // append it to main container
    let mainContainer = document.querySelector(".main-container");
    mainContainer.appendChild(cookieNoticeElement);
    
    let p = document.createElement("p");
    p.innerHTML = `Ta strona używa plików <b>ciasteczek</b>, by zapamiętywać dane o twoim głosie.
        Jeżeli nie wyrażasz na to zgody, korzystanie z aplikacji może być utrudnione.
        Twoja zgoda i inne dane będą zapamiętane i przechowywane, wyłącznie na Twoim urządzeniu, przez 365 dni.`
    cookieNoticeElement.appendChild(p);
    let denyButton = document.createElement("button");
    denyButton.innerHTML = "Nie wyrażam zgody";
    denyButton.id = "deny";
    denyButton.onclick = removeCookieNotice;
    cookieNoticeElement.appendChild(denyButton);

    let acceptButton = document.createElement("button");
    acceptButton.innerHTML = "Wyrażam zgodę";
    acceptButton.id = "accept";
    acceptButton.onclick = () => {
        Cookies.set("accepted", "true", { expires: 365 });
        cookiesAccepted = true;
        removeCookieNotice();
    }
    cookieNoticeElement.appendChild(acceptButton);
}
else {
    init();
}

function removeCookieNotice() {
    cookieNoticeElement.remove();
    formantsContainer.style.display = "block";
    recordingContainer.style.display = "flex";
    canvas.style.display = "block";
    init();
}

function draw() {
    if (audioRecorder.samplesCollected < WaveformVisualizer.bufferLength / 128) {
        requestAnimationFrame(draw);
        return;
    }

    const samples = audioRecorder.dump();

    formantVisualizer.feed(samples);
    waveformVisualizer.feed(samples);

    requestAnimationFrame(draw);
}

async function init() {
    audioRecorder = new AudioRecorder();
    await audioRecorder.init();
    formantVisualizer = new FormantVisualizer(audioRecorder.sampleRate);
    waveformVisualizer = new WaveformVisualizer();
    audioRecorder.onStart = () => {
        formantVisualizer.recordingStarted();
        waveformVisualizer.reset();
    };

    audioRecorder.onStop = () => {
        formantVisualizer.recordingStopped();
    }

    draw();
}


var stream = null;
try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
}
catch (error) {
    console.log("An error occured: " + error);
}
var audioCtx = null, source = null, audioBufferData = [], recorderNode = null;
var initialized = false;

var recordingIndicator = document.querySelector('.recording-indicator');

async function init() {
    audioCtx = new AudioContext();
    source = audioCtx.createMediaStreamSource(stream);
    await audioCtx.audioWorklet.addModule('recorder-worklet-processor.js');
    recorderNode = new AudioWorkletNode(audioCtx, 'recorder-processor');
    recorderNode.port.onmessage = (event) => {
        const inputData = event.data;
        audioBufferData.push(new Float32Array(inputData));
    };
}

async function startRecording() {
    audioBufferData = [];
    if (!initialized) {
        await init();
        initialized = true;
    }
    // Step 7: Connect the source to the AudioWorkletNode and the node to the destination
    source.connect(recorderNode);
    recorderNode.connect(audioCtx.destination);
    recordingIndicator.style.display = 'block';
}

function stopRecording() {
    recorderNode.disconnect();
    source.disconnect();
    recordingIndicator.style.display = 'none';

    // Concatenate all recorded audio chunks
    const totalLength = audioBufferData.reduce((total, chunk) => total + chunk.length, 0);
    const audioBuffer = audioCtx.createBuffer(1, totalLength, audioCtx.sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    let offset = 0;
    for (const chunk of audioBufferData) {
        channelData.set(chunk, offset);
        offset += chunk.length;
    }

    console.log('AudioBuffer:', audioBuffer);
}

var recordButton = document.querySelector('.record-button');
recordButton.addEventListener('mousedown', startRecording);
recordButton.addEventListener('mouseup', stopRecording);
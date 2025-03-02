export async function playSamples(samples, sampleRate = 48000) {
    const audioContext = new AudioContext({ sampleRate });
    const buffer = audioContext.createBuffer(1, samples.length, sampleRate);
    buffer.copyToChannel(samples, 0);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    await new Promise(resolve => source.onended = resolve);
    source.disconnect();
    audioContext.close();
}
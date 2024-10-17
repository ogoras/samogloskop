import { drawWaveform } from './drawWaveform.js';

const bufferLength = 1024;

export class WaveformVisualizer {
    dataArray = new Float32Array(bufferLength);

    static get bufferLength() {
        return bufferLength;
    }

    constructor() {
        this.canvas = document.getElementsByClassName("visualizer")[0];
        this.canvasCtx = this.canvas.getContext("2d");    
    }

    feed(samples) {
        if (bufferLength > samples.length) {
            samples.splice(0, 0, ...this.dataArray.slice(samples.length, bufferLength));
        }
        this.dataArray.set(samples.slice(samples.length - bufferLength, samples.length));
    
        drawWaveform(this.dataArray, bufferLength, this.canvas, this.canvasCtx);
    }

    reset() {
        this.dataArray.fill(0);
    }
}
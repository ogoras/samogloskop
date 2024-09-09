class RecorderProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.buffer = [];
    }

    process(inputs, outputs, parameters) {
        // Get the input data from the microphone
        const input = inputs[0];
        if (input.length > 0) {
            const inputChannelData = input[0]; // Assume mono input

            // Clone the data so we can store it
            this.buffer.push(new Float32Array(inputChannelData));

            // Send the data back to the main thread
            this.port.postMessage(inputChannelData);
        }

        // Returning true keeps the processor alive
        return true;
    }
}

// Register the processor so the AudioWorkletNode can use it
registerProcessor('recorder-processor', RecorderProcessor);
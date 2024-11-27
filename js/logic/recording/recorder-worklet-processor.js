class RecorderProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input.length > 0) {
            // assume mono input
            this.port.postMessage(input[0]);
        }

        // Returning true keeps the processor alive
        return true;
    }
}

// Register the processor so the AudioWorkletNode can use it
registerProcessor('recorder-processor', RecorderProcessor);
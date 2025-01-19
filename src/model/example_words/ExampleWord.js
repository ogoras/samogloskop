import ExamplePhrase from "./ExamplePhrase.js";
import VowelRecording from "../recordings/VowelRecording.js";

export default class ExampleWord {
    constructor(word, transcription, translation, priority = 0) {
        this.word = word;
        this.transcription = transcription;
        this.translation = translation;
        this.priority = priority;
        this.recordingPlaybacks = [];
        this.examples = [];
    }

    addExample(...args) {
        if (args[0] instanceof VowelRecording) {
            if (this.priority === 0) {
                this.priority = 2;
            } else if (this.priority === 1) {
                this.priority = 1.5;
            } else {
                this.priority += 1;
            }
            this.recordingPlaybacks.push(() => args[0].play("word"));
            return;
        }
        this.examples.push(new ExamplePhrase(...args));
    }
}
import ExamplePhrase from "./ExamplePhrase.js";
import VowelRecording from "../recordings/VowelRecording.js";

export default class ExampleWord {
    constructor(word, transcription, translation) {
        this.word = word;
        this.transcription = transcription;
        this.translation = translation;
        this.recordingPlaybacks = [];
        this.examples = [];
    }

    addExample(...args) {
        if (args[0] instanceof VowelRecording) {
            this.recordingPlaybacks.push(() => args[0].play("word"));
            return;
        }
        this.examples.push(new ExamplePhrase(...args));
    }
}
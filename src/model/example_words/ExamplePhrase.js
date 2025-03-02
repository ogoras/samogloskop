import VowelRecording from "../recordings/VowelRecording.js";

export default class ExamplePhrase {
    get hasRecording() {
        return this.recording !== undefined;
    }

    constructor(arg1, arg2) {
        if (arg1 instanceof VowelRecording) {
            const recording = arg1;
            this.text = recording.phrase;
            this.translation = recording.phraseTranslation;
            this.playback = () => recording.play("phrase");
            this.recording = recording;
        } else {
            this.text = arg1;
            this.translation = arg2;
        }
    }
}
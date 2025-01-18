import ExampleWord from './ExampleWord.js';

export default class VowelWords extends Array {
    constructor(recordings, plainWords) {
        super();
        this.recordings = recordings;
        this.plainWords = plainWords;

        const exampleWords = new Map();
        for (const plainWord of plainWords) {
            const word = plainWord[0];
            if (!exampleWords.has(word)) {
                exampleWords.set(word, new ExampleWord(...plainWord));
            }
            if (plainWord[4] && plainWord[5]) {
                exampleWords.get(word).addExample(plainWord[4], plainWord[5]);
            }
        }
        for (const recording of recordings) {
            const word = recording.word;
            if (!exampleWords.has(word)) {
                exampleWords.set(word, 
                    new ExampleWord(word, recording.transcription, recording.translation)
                );
            }
            exampleWords.get(word).addExample(recording);
        }
        
        this.push(...exampleWords.values());
    }
}
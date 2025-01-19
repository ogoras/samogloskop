import ExampleWord from './ExampleWord.js';

export default class VowelWords extends Array {
    constructor(vowelSymbol, recordings, plainWords) {
        super();
        this.vowelSymbol = vowelSymbol;
        this.recordings = recordings;
        this.plainWords = plainWords;

        const exampleWords = new Map();
        for (const plainWord of plainWords) {
            const word = plainWord[0];
            const transcription = plainWord[1];
            const newTranscription = [];
            for (const symbol of transcription) {
                if (symbol === vowelSymbol) {
                    newTranscription.push(`<b>${symbol}</b>`);
                } else {
                    newTranscription.push(symbol);
                }
            }
            plainWord[1] = newTranscription.join("");
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
                    new ExampleWord(word, recording.getWordTranscription("all"), recording.wordTranslation)
                );
            }
            exampleWords.get(word).addExample(recording);
        }
        
        this.push(...exampleWords.values());
    }
}
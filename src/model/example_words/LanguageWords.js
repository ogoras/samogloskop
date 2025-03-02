import DataLoadedFromFile from "../DataLoadedFromFile.js";
import { VOWEL_DATA } from "../../const/VOWEL_INVENTORIES.js";
import VowelWords from "./VowelWords.js";

export default class LanguageWords extends DataLoadedFromFile {
    constructor(recordings, language = "EN") {
        super();
        this.recordings = recordings;
        this.language = language;
    }

    async _load() {
        const path = `./data/example_words/${this.language}.json`;
        const example_words = await (await fetch(path)).json();
        await this.recordings.load();

        const vowelData = VOWEL_DATA[this.language];
        for (const vowelSymbol of vowelData.letter ?? vowelData.IPA.broad) {
            this[vowelSymbol] = new VowelWords(
                vowelSymbol,
                this.recordings.uniqueWordEntriesByVowel[vowelSymbol],
                example_words[vowelSymbol]
            );
        }
    }
}
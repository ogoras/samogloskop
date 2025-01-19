export default class SelectedVowelDisplay {
    element = document.createElement("div");
    h2 = document.createElement("h2");
    hint = document.createElement("p");
    wordList = document.createElement("div");
    
    constructor(container, prevSibling) {
        const h2 = this.h2;
        h2.innerHTML = "<span></span> występuje w słowach:";
        this.span = h2.querySelector("span");
        h2.style.fontWeight = "bolder";
        this.element.appendChild(h2);
        h2.style.display = "none";

        const hint = this.hint;
        hint.innerHTML = "Naciśnij na samogłoskę na wykresie, żeby się na niej skupić.";
        hint.classList.add("gray");
        this.element.appendChild(hint);

        const wordList = this.wordList;
        wordList.innerHTML = "Niestety, nie udało się wczytać listy słów :(";
        this.element.appendChild(wordList);
        this.wordList.style.display = "none";

        container.appendChild(this.element);
        prevSibling.after(this.element);
    }

    addWords(words) {
        this.words = words;
    }

    selectVowel(vowel) {
        this.h2.style.display = null;
        this.hint.innerHTML = "Żeby odznaczyć samogłoskę, naciśnij na nią ponownie.";

        const span = this.span;
        span.innerHTML = vowel.letter;
        span.style.color = `#${vowel.rgb}`;

        const wordList = this.wordList;
        wordList.style.display = null;
        wordList.style.marginBottom = "1em";
        if (this.words) {
            wordList.style.display = "grid";
            wordList.style.gridTemplateColumns = "max-content max-content max-content auto";
            wordList.style.columnGap = "1em"; 
            wordList.innerHTML = "";
            const words = this.words[vowel.letter];
            for (const wordEntry of words) {
                const word = document.createElement("span");
                word.innerHTML = wordEntry.word;
                wordList.appendChild(word);

                const transcription = document.createElement("span");
                transcription.innerHTML = `/${wordEntry.transcription}/`;
                wordList.appendChild(transcription);

                const translation = document.createElement("span");
                translation.innerHTML = `<i>${wordEntry.translation}</i>`;
                wordList.appendChild(translation);

                const playButtonsDiv = document.createElement("div");
                wordList.appendChild(playButtonsDiv);
                playButtonsDiv.innerHTML = "▶";
            }
        }
    }

    deselectVowel() {
        this.h2.style.display = "none";
        this.hint.style.display = "none";
        this.wordList.style.display = "none";
        this.wordList.style.marginBottom = null;
    }
} 

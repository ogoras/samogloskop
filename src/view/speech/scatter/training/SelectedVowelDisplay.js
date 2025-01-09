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

    addRecordings(recordings) {
        this.recordings = recordings;
    }

    selectVowel(vowel) {
        this.h2.style.display = null;
        this.wordList.style.display = null;
        this.hint.innerHTML = "Żeby odznaczyć samogłoskę, naciśnij na nią ponownie.";
        const span = this.span;
        span.innerHTML = vowel.letter;
        span.style.color = `#${vowel.rgb}`;
    }

    deselectVowel() {
        this.h2.style.display = "none";
        this.hint.style.display = "none";
        this.wordList.style.display = "none";
    }
} 

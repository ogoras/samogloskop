import Component from "../Component.js";
import VowelButtonsComponent from "./VowelButtonsComponent.js";

export default class SelectedVowelDisplay extends Component {
    vowelHeader = document.createElement("h2");
    selectionHeader = document.createElement("h2");
    hint = document.createElement("p");
    wordList = document.createElement("div");
    button = document.createElement("button");
    
    #currentlyPlaying = false;
    #standalone;
    
    constructor(parent, controller, container, sibling, isAfterSibling = true, standalone = false) {
        super(null, null, container);

        this.#standalone = standalone;
        this.controller = controller;
        this.parent = parent;

        const vowelHeader = this.vowelHeader;
        vowelHeader.innerHTML = "<span></span> występuje w słowach:";
        this.span = vowelHeader.querySelector("span");
        vowelHeader.style.fontWeight = "bolder";
        this.element.appendChild(vowelHeader);
        vowelHeader.style.display = "none";

        if (!standalone) {
            const hint = this.hint;
            hint.innerHTML = "Naciśnij na samogłoskę na wykresie, żeby się na niej skupić.";
            hint.classList.add("gray");
            this.element.appendChild(hint);
        } else {
            const selectionHeader = this.selectionHeader;
            selectionHeader.innerHTML = "Losowy wybór przydzielił Cię do grupy kontrolnej. Oznacza to, że wciąż możesz ćwiczyć samogłoski, ale bez pomocy wykresu. Po badaniu otrzymasz link do pełnej wersji aplikacji. Wybierz samogłoskę, żeby zobaczyć słowa, w których występuje:";
            this.element.appendChild(selectionHeader);

            this.vowelButtonsComponent = new VowelButtonsComponent(this);

            this.buttonContainer = document.createElement("div");
            this.buttonContainer.style.display = "flex";
            this.buttonContainer.style.justifyContent = "center";
            this.buttonContainer.style.paddingTop = "1em";
            this.element.appendChild(this.buttonContainer);

            this.button.innerHTML = "OK";
            this.button.onclick = () => this.nextMessage();
            this.buttonContainer.appendChild(this.button);
        }

        const wordList = this.wordList;
        wordList.innerHTML = "Niestety, nie udało się wczytać listy słów :(";
        this.element.appendChild(wordList);
        this.wordList.style.display = "none";

        if (isAfterSibling) {
            sibling.after(this.element);
        } else {
            container.insertBefore(this.element, sibling);
        }
    }

    addWords(words) {
        this.words = words;
    }

    selectVowel(vowel) {
        this.vowelHeader.style.display = null;
        this.hint.innerHTML = "Żeby odznaczyć samogłoskę, naciśnij na nią ponownie.";

        const span = this.span;
        span.innerHTML = vowel.letter;
        span.style.color = `#${vowel.rgb}`;

        const wordList = this.wordList;
        wordList.style.display = null;
        wordList.style.marginBottom = "1em";
        if (this.words) {
            wordList.style.display = "grid";
            wordList.style.gridTemplateColumns = "max-content max-content max-content max-content auto";
            wordList.style.columnGap = "1em"; 
            wordList.innerHTML = "";
            const words = this.words[vowel.letter];
            for (const wordEntry of words) {
                const word = document.createElement("span");
                word.innerHTML = wordEntry.word;
                word.style.fontSize = "1.4em";
                word.style.marginBottom = "0.2em";
                wordList.appendChild(word);

                const transcription = document.createElement("span");
                transcription.innerHTML = `/${wordEntry.transcription}/`;
                transcription.style.fontSize = "1.2em";
                wordList.appendChild(transcription);

                const bElements = transcription.querySelectorAll("b");
                for (const bElement of bElements) {
                    bElement.style.color = `#${vowel.rgb}`;
                }

                const translation = document.createElement("span");
                translation.innerHTML = `<i>${wordEntry.translation}</i>`;
                wordList.appendChild(translation);

                const showMoreButton = document.createElement("span");
                wordList.appendChild(showMoreButton);

                const examplesDiv = document.createElement("div");
                if (wordEntry.examples.length > 0) {
                    examplesDiv.style.display = "none";
                    examplesDiv.style.gridColumn = "1 / 6";
                    examplesDiv.style.marginTop = "-0.3em";
                    examplesDiv.style.marginBottom = "0.5em";
                    examplesDiv.style.paddingLeft = "1em";

                    for (const example of wordEntry.examples) {
                        const english = document.createElement("div");
                        examplesDiv.appendChild(english);

                        const phraseText = document.createElement("span");
                        let text = example.text;
                        // bold the word in the phrase, maintaining case
                        text = text.replace(new RegExp(`\\b${wordEntry.word}\\b`, "g"), `<b>${wordEntry.word}</b>`);
                        text = text.replace(new RegExp(`\\b${wordEntry.word[0].toUpperCase() + wordEntry.word.slice(1)}\\b`, "g"), `<b>${wordEntry.word[0].toUpperCase() + wordEntry.word.slice(1)}</b>`);
                        phraseText.innerHTML = text;
                        phraseText.style.fontSize = "1.2em";
                        english.appendChild(phraseText);

                        if (example.playback) {
                            const playButton = document.createElement("span");
                            playButton.innerHTML = "▶";
                            playButton.classList.add("button");
                            playButton.classList.add("compact");
                            playButton.style.marginLeft = "0.3em";
                            playButton.onclick = async () => {
                                if (this.#currentlyPlaying) return;
                                this.#currentlyPlaying = true;
                                // disable mic while playing
                                this.controller.disableMic();
                        
                                await example.playback();
                                
                                this.controller.enableMic();
                                this.#currentlyPlaying = false;
                            }
                            english.appendChild(playButton);
                        }

                        const translation = document.createElement("span");
                        translation.innerHTML = `<i>${example.translation}</i>`;
                        examplesDiv.appendChild(translation);
                    }

                    showMoreButton.innerHTML = "˅";
                    showMoreButton.classList.add("arrow");
                    showMoreButton.classList.add("button");
                    showMoreButton.classList.add("compact");
                    showMoreButton.onclick = () => {
                        if (examplesDiv.style.display === "none") {
                            examplesDiv.style.display = null;
                            showMoreButton.innerHTML = "˄";
                        } else {
                            examplesDiv.style.display = "none";
                            showMoreButton.innerHTML = "˅";
                        }
                    }
                }

                const playButtonsDiv = document.createElement("div");
                wordList.appendChild(playButtonsDiv);
                playButtonsDiv.style.marginTop = "-0.2em";

                for (const playbackFunction of wordEntry.recordingPlaybacks) {
                    const playButton = document.createElement("span");
                    playButton.innerHTML = "▶";
                    playButton.classList.add("button");
                    playButton.classList.add("compact");
                    playButton.style.marginRight = "0.3em";
                    playButton.onclick = async () => {
                        if (this.#currentlyPlaying) return;
                        this.#currentlyPlaying = true;
                        // disable mic while playing
                        this.controller.disableMic();
                
                        await playbackFunction();
                        
                        this.controller.enableMic();
                        this.#currentlyPlaying = false;
                    }
                    playButtonsDiv.appendChild(playButton);
                }

                if (wordEntry.examples.length > 0) {
                    wordList.appendChild(examplesDiv);
                }
            }
        }

        if (this.#standalone) {
            this.vowelButtonsComponent.hidden = true;
            this.selectionHeader.style.display = "none";
            this.parent.changeCornerButton();
            this.buttonContainer.style.display = "none";
        }
    }

    deselectVowel() {
        this.vowelHeader.style.display = "none";
        this.hint.style.display = "none";
        this.wordList.style.display = "none";
        this.wordList.style.marginBottom = null;

        if (this.#standalone) {
            this.vowelButtonsComponent.hidden = false;
            this.selectionHeader.style.display = null;
            this.buttonContainer.style.display = "flex";
        }
    }

    nextMessage() {
        this.selectionHeader.innerHTML = "Jeśli czujesz się w gotowości do testu końcowego, naciśnij przycisk na dole."

        this.button.innerHTML = "Przejdź do testu końcowego";
        this.button.onclick = () => {
            if (confirm("Czy na pewno chcesz przejść do testu końcowego? Nie będzie można już wrócić do ćwiczenia.")) {
                document.body.style.padding = null;
                this.controller.next();
            }
        }
    }
} 

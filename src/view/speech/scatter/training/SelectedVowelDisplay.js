export default class SelectedVowelDisplay {
    element = document.createElement("div");
    h2 = document.createElement("h2");
    hint = document.createElement("p");
    wordList = document.createElement("div");
    
    #currentlyPlaying = false;
    
    constructor(controller, container, prevSibling) {
        this.controller = controller;

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
    }

    deselectVowel() {
        this.h2.style.display = "none";
        this.hint.style.display = "none";
        this.wordList.style.display = "none";
        this.wordList.style.marginBottom = null;
    }
} 

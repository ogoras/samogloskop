import Component from "../Component.js";
import { VOWEL_INVENTORIES } from "../../../const/VOWEL_INVENTORIES.js"
import Vowel from "../../../model/vowels/Vowel.js";

export default class VowelButtonsComponent extends Component {
    set hidden(value) {
        super.hidden = value;
        if (!value) {
            this.element.style.display = "grid";
        }
    }

    constructor(parent) {
        super(null, null, parent);
        this.element.style.display = "grid";
        // make it a grid with columns that are at least 3em wide and add up to 100%
        this.element.style.gridTemplateColumns = "repeat(auto-fill, minmax(5em, 1fr))";
        this.element.style.gap = "0.5em";
        this.element.style.width = "auto";

        const vowels = VOWEL_INVENTORIES.EN;
        for (const vowel of vowels) {
            const button = document.createElement("button");
            button.innerHTML = vowel.IPA.broad;
            button.style.color = `#${vowel.rgb}`;
            button.style.fontSize = "2em";
            button.style.fontWeight = "bold";
            button.addEventListener("click", () => {
                parent.selectVowel(new Vowel(vowel));
            });
            this.appendChild(button);
        }
    }
}
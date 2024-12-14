import ChoiceView from "./ChoiceView.js";
import NewTabButton from "../components/NewTabButton.js";

const noticeText = `Ta strona używa pamięci <b>localStorage</b>, by zapamiętywać dane o twoim głosie.
    Jeżeli nie wyrażasz na to zgody, korzystanie z aplikacji może być utrudnione.
    Twoja zgoda i inne dane będą zapamiętane, przechowywane i przetwarzane, wyłącznie na Twoim urządzeniu.
    <br>
    <a href ="privacy.html" target=”_blank”> Polityka prywatności </a>`
const choices = [
    {
        text: "Nie wyrażam zgody",
        id: "deny",
        returnValue: false
    },
    {
        text: "Wyrażam zgodę",
        id: "accept",
        returnValue: true
    }
]


export default class ConsentView extends ChoiceView {
    constructor(onStateChange) {
        super(onStateChange, noticeText, choices);

        const parentContainer = document.querySelector(".main-container");

        const div = document.createElement("div");
        parentContainer.appendChild(div);
        const moreButton = new NewTabButton(
                div,
                "Więcej",
                "info.html"
            ).element;
        // put the button in the center
        moreButton.style.margin = "auto";
        moreButton.style.display = "block";

        div.style.text = "center";
        div.style.margin = "1rem";
    }
}
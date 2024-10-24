import ChoiceView from "./ChoiceView.js";

const noticeText = `Ta strona używa pamięci <b>localStorage</b>, by zapamiętywać dane o twoim głosie.
    Jeżeli nie wyrażasz na to zgody, korzystanie z aplikacji może być utrudnione.
    Twoja zgoda i inne dane będą zapamiętane, przechowywane i przetwarzane, wyłącznie na Twoim urządzeniu.
    <br>
    <a href ="privacy.html" target=”_blank”> Polityka prywatności </a>`
const choices = [
    {
        text: "Nie wyrażam zgody",
        id: "deny",
        updates: { accepted: false }
    },
    {
        text: "Wyrażam zgodę",
        id: "accept",
        updates: { accepted: true }
    }
]


export default class ConsentView extends ChoiceView {
    constructor(onStateChange) {
        super(onStateChange, noticeText, choices);
    }
}
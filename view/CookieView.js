import { ChoiceView } from "./ChoiceView.js";

const noticeText = `Ta strona używa plików <b>ciasteczek</b>, by zapamiętywać dane o twoim głosie.
    Jeżeli nie wyrażasz na to zgody, korzystanie z aplikacji może być utrudnione.
    Twoja zgoda i inne dane będą zapamiętane i przechowywane, wyłącznie na Twoim urządzeniu, przez 365 dni.`
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


export class CookieView extends ChoiceView {
    constructor(onStateChange) {
        super(onStateChange, noticeText, choices);
    }
}
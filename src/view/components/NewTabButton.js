export default class NewTabButton{
    constructor(parent, text, url) {
        this.element = document.createElement("button");
        this.element.innerHTML = text;
        this.element.onclick = () => {
            window.open(url, "_blank");
        };
        this.element.classList.add("tiny");
        parent.appendChild(this.element);
    }
}
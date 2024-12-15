export default class MoreInfo{
    constructor(parent) {
        const div = this.div = document.createElement("div");
        parent.appendChild(div);

        this.element = document.createElement("a");
        this.element.innerHTML = "Więcej informacji";
        this.element.href = "info.html";
        this.element.target = "_blank";
        div.appendChild(this.element);

        this.element.style.fontSize = "0.8rem"

        div.style.textAlign = "right";
        div.style.margin = "0.5rem";
    }

    destroy() {
        this.div.remove();
    }
}
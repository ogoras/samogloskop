import Component from "./Component.js";

export default class MoreInfo extends Component {
    constructor(parent) {
        super(null, null, parent);

        this.a = document.createElement("a");
        this.a.innerHTML = "Więcej informacji";
        this.a.href = "info.html";
        this.a.target = "_blank";
        this.a.style.fontSize = "0.8rem"
        this.element.appendChild(this.a);

        this.element.style.textAlign = "right";
        this.element.style.margin = "0.5rem";
    }
}
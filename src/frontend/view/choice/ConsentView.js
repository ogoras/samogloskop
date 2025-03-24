import ChoiceView from "./ChoiceView.js";
import ConsentComponent from "../../components/choice/ConsentComponent.js";

export default class ConsentView extends ChoiceView {
    constructor(controller) {
        super(controller, ConsentComponent);

        this.h2 = document.createElement("h2");
        this.h2.innerHTML = "Witaj w aplikacji <b>Samogłoskop</b>! Na początek obejrzyj krótki filmik instruktażowy.";
        this.container.appendChild(this.h2);
        this.container.insertBefore(this.h2, this.container.firstChild);

        this.iframe = document.createElement("iframe");
        this.iframe.src = "https://www.youtube.com/embed/u7rLlYYY-es";
        this.iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        this.iframe.referrerPolicy = "strict-origin-when-cross-origin";
        this.iframe.allowFullscreen = true;

        this.h2.after(this.iframe);
    }

    destroy() {
        this.h2.remove();
        this.iframe.remove();
        super.destroy();
    }
}
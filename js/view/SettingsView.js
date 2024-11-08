import View from "./View.js";

export default class SettingsView extends View {
    constructor(onStateChange, closeCallback, formantProcessor) {
        super(onStateChange);
        this.closeCallback = closeCallback;
        this.formantProcessor = formantProcessor;
        
        this.mainContainer = document.createElement("div");
        this.mainContainer.classList.add("main-container");
        document.body.appendChild(this.mainContainer);

        this.closeButton = document.createElement("div");
        this.closeButton.classList.add("emoji-button");
        this.closeButton.innerHTML = "❌";
        this.closeButton.onclick = this.close.bind(this);
        this.mainContainer.appendChild(this.closeButton);
    }

    close() {
        this.mainContainer.remove();
        this.closeCallback();
    }
}
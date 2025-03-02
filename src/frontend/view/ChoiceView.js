import View from './View.js';
import MoreInfo from '../components/MoreInfo.js';

export default class ChoiceView extends View {
    constructor(controller, ChoiceComponent, parentContainer, selectedIndex, extraAction) {
        super(controller);
        // check if parent.choose is a function
        if (typeof controller.choose !== "function") throw new Error("Controller must have a choose method");

        if(!parentContainer) parentContainer = document.querySelector(".main-container");

        this.container = parentContainer;

        this.component = new ChoiceComponent(this, selectedIndex, extraAction);

        this.moreInfo = new MoreInfo(this.container);
    }

    destroy() {
        this.component.destroy?.();
        this.moreInfo.destroy();
    }
}
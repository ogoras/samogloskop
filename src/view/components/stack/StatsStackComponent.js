import StackComponent from "./StackComponent.js";

export default class StatsStackComponent extends StackComponent {
    element = undefined;

    constructor(prev) {
        super(null);
        this.element = prev.element;
        this.h2 = prev.h2;
        this.parent = prev.parent;
        
        this.hidden = prev.hidden;
    }
}
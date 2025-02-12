import Component from "../Component.js";

export default class SelectorComponent extends Component {
    #selected;
    hideOnUnselect = false;

    set selected(choice) {
        this.#selected = choice;
        this.fill?.(choice);
        this.parent.plotComponent.scatterPlot.getGroup(this.plotGroupId).forEach(group => group[this.subgroupId].g.style("display", choice ? "block" : "none"));
    }

    get selected() {
        return this.#selected;
    }

    constructor(parent, plotGroupId, subgroupId, locked = false, showOnSelect = false, tagName = "svg") {
        super(null, null, parent, tagName);
        
        this.plotGroupId = plotGroupId;
        this.subgroupId = subgroupId;

        this.element.addEventListener("click", () => {
            if (locked) return;
            if (showOnSelect) this.hideOnUnselect = false;
            this.selected = !this.selected;
        });
    }
}
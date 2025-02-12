import Component from "../Component.js";
import CentroidSelectorComponent from "./CentroidSelectorComponent.js";
import CloudSelectorComponent from "./CloudSelectorComponent.js";
import EllipseSelectorComponent from "./EllipseSelectorComponent.js";

export default class SelectorsComponent extends Component {
    polishCentroidsLocked = false;
    hidePBEllipsesOnUnselect = false;
    selectors = [];
    
    constructor(parent, plotComponent, nativeOnly) {
        super(null, null, parent);
        this.plotComponent = plotComponent;
        this.nativeOnly = nativeOnly;

        this.element.style = "display: grid; grid-template-columns: 30px 30px 30px auto; gap: 0px";

        if (nativeOnly) {
            this.#createSelectorRow(
                ` <b>←</b> <text class="serif gray">wybór reprezentacji</text>`,
                ["e", "a", "o", "y"],
                ["#faa500", "#ff0000", "#ff00ff", "#964b00"],
                true
            )
        } else {
            // TODO: implement
        }
    }

    #createSelectorRow(divHTML, letters, colors, serif, style, localGroupId = 0, plotGroupId = 0, cloudOffset = 0, initiallySelected) {
        const selectorsInRow = [];
        
        selectorsInRow.push(new CentroidSelectorComponent(this, plotGroupId, 2, initiallySelected?.[2] ?? true, false, false, letters[0], colors[0], serif, style));

        selectorsInRow.push(new CloudSelectorComponent(this, plotGroupId, 0, initiallySelected?.[0] ?? true, false, false, letters.slice(1), colors.slice(1), cloudOffset, serif, style));

        selectorsInRow.push(new EllipseSelectorComponent(this, plotGroupId, 1, initiallySelected?.[1] ?? true));

        this.selectors.push(selectorsInRow);

        const div = document.createElement("div");
        div.style = "margin-top: auto; margin-bottom: auto;";
        div.innerHTML = divHTML;
        this.appendChild(div);
    }
}
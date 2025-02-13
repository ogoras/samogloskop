import SelectorComponent from './SelectorComponent.js';

export default class CentroidSelectorComponent extends SelectorComponent {
    constructor(parent, plotGroupId, subgroupId, initiallySelected, locked = () => false, showOnSelect = false, letter, color, serif, style) {
        super(parent, plotGroupId, subgroupId, locked, showOnSelect, "text");
        this.color = color;

        const text = this.element;
        text.classList.add("button");
        text.innerHTML = letter;
        if (style) text.style = style;
        if (serif) {
            text.classList.add("serif");
            text.style.fontWeight = "700";
        }
        text.style.color = initiallySelected ? color : "gray";
        text.style.fontSize = "1.66em";
        text.style.textAlign = "center";
        
        this.selected = initiallySelected;
    }

    fill(choice) {
        this.element.style.color = choice ? this.color : "gray";
    }
}
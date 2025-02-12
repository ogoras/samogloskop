import SelectorComponent from './SelectorComponent.js';

export default class CloudSelectorComponent extends SelectorComponent {
    constructor(parent, plotGroupId, subgroupId, initiallySelected, locked = false, showOnSelect = false, letters, colors, xoffset, serif, style) {
        super(parent, plotGroupId, subgroupId, locked, showOnSelect);
        this.colors = colors;

        const svg = this.element;
        svg.setAttribute("width", "30");
        svg.setAttribute("height", "30");
        svg.classList.add("button")
        if (serif) svg.classList.add("serif");
        if (style) svg.style = style;

        // add text inside the square
        const text1 = this.text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text1.setAttribute("x", 12 + xoffset);
        text1.setAttribute("y", "25");
        text1.setAttribute("fill", initiallySelected ? colors[0] : "gray");
        text1.innerHTML = letters[0];
        svg.appendChild(text1);

        const text2 = this.text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text2.setAttribute("x", "18");
        text2.setAttribute("y", "18");
        text2.setAttribute("fill", initiallySelected ? colors[1] : "gray");
        text2.innerHTML = letters[1];
        svg.appendChild(text2);

        const text3 = this.text3 = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text3.setAttribute("x", "5");
        text3.setAttribute("y", "18");
        text3.setAttribute("fill", initiallySelected ? colors[2] : "gray");
        text3.innerHTML = letters[2];
        svg.appendChild(text3);
        
        this.selected = initiallySelected;
    }

    fill(choice) {
        if (choice) {
            this.text1.setAttribute("fill", this.colors[0]);
            this.text2.setAttribute("fill", this.colors[1]);
            this.text3.setAttribute("fill", this.colors[2]);
        } else {
            this.text1.setAttribute("fill", "gray");
            this.text2.setAttribute("fill", "gray");
            this.text3.setAttribute("fill", "gray");
        }
    }
}
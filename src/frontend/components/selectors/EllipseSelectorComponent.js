import SelectorComponent from './SelectorComponent.js';

export default class EllipseSelectorComponent extends SelectorComponent {
    constructor(parent, plotGroupId, subgroupId, initiallySelected, locked = () => false, showOnSelect = false) {
        super(parent, plotGroupId, subgroupId, locked, showOnSelect);

        this.element.setAttribute("width", "30");
        this.element.setAttribute("height", "30");
        this.element.classList.add("button");

        // add an ellipse
        let ellipse = this.ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
        ellipse.setAttribute("cx", "15");
        ellipse.setAttribute("cy", "15");
        ellipse.setAttribute("rx", "10");
        ellipse.setAttribute("ry", "5");
        ellipse.setAttribute("transform", "rotate(-40 15 15)");
        ellipse.setAttribute("fill", "none");
        ellipse.setAttribute("stroke", initiallySelected ? "blue" : "gray");
        ellipse.setAttribute("stroke-width", "2");
        this.element.appendChild(ellipse);

        this.selected = initiallySelected;
    }

    fill(choice) {
        this.ellipse?.setAttribute("stroke", choice ? "blue" : "gray");
    }
}
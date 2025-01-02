import ScatterView from "./ScatterView.js";
import { POINT_SIZES } from '../../../const/POINT_SIZES.js';
import { VOWEL_INVENTORIES } from "../../../const/VOWEL_INVENTORIES.js";
import Vowel from "../../../model/vowels/Vowel.js";
import { append_checkbox, append_h } from "../../dom/dom_utils.js";
import nullish from "../../../logic/util/nullish.js";

export default class TrainingView extends ScatterView {
    #datasetAdded = false;
    #currentMessage = 0;
    checkboxes = [];

    #datasetCount = 1;
    #representationsSelected = [
        [false, true],
        [false, false],
        [true, false],
        [false, true]
    ]

    constructor(controller, arg, recycle = false, parent) {
        super(controller, arg, recycle);

        // iterate through all children of divStack and remove them except h2
        const children = [...this.divStack.children];
        for (let i = 0; i < children.length; i++) {
            if (children[i] !== this.h2) {
                children[i].remove();
            }
        }

        this.h2.innerHTML = `Jesteś teraz w trybie ćwiczenia. 
                Powiedz samogłoskę i zobacz jej formanty na tle samogłosek podstawowych.`;
        this.divStack.appendChild(this.h2);

        const buttons = this.divStack.querySelectorAll("button");
        buttons.forEach(button => button.remove());
        
        const button = this.button = document.createElement("button");
        button.innerHTML = "OK";
        button.onclick = () => {
            this.nextMessage();
        }
        this.divStack.appendChild(button);

        if (recycle) {
            // remove all elements from the div
            while (this.div.firstChild) {
                this.div.removeChild(this.div.firstChild);
            }
            this.initializePlot();
        }

        this.scatterPlot.addSeriesFormatting({ fontWeight: 700, serif: true }, 0);
        
        const nativeVowels = controller.nativeVowels;
        nativeVowels.vowelsProcessed.forEach(vowel => {
            const id = vowel.id;
            
            vowel.formants.forEach(formant => {
                this.saveFormants(formant, id);
            });
            this.vowelCentroid(vowel);
            this.vowelEllipse(vowel.confidenceEllipse, id);
        });

        this.#addVowelMeasurements(controller.foreignInitial, 1, d3.symbolTriangle, "FF", { italic: true })

        this.divStack.style.width = "auto";

        const sideContainer = this.sideContainer = parent.sideContainer;
        const moreInfo = parent.moreInfo;

        this.timer = {
            element: document.createElement("span"),
            visible: false,
            setTime: function(time) {
                this.time = time;
                function twoDigits(num) { return num.toString().padStart(2, '0'); }
                const hh = Math.floor(time / 3600);
                const mm = twoDigits(Math.floor(time / 60) % 60);
                const ss = twoDigits(time % 60);
                this.element.innerHTML = `Ćwiczysz już: ${hh}:${mm}:${ss}`;
            },
            show: function(timeMs) {
                this.visible = true;
                sideContainer.insertBefore(this.element, moreInfo.div);
                if (!nullish(timeMs)) this.setTime(Math.floor(timeMs / 1000));
            },
            resume: function() {
                if (!this.visible) throw new Error("Tried to resume timer when it's not visible");
                if (this.interval) throw new Error("Timer already running");
                this.interval = setInterval(() => this.setTime(this.time + 1), 1000);
            },
            pauseAndUpdate: function(timeMs) {
                if (!this.visible) throw new Error("Tried to pause and update timer when it's not visible");
                if (!this.interval) throw new Error("Timer not running");
                clearInterval(this.interval);
                this.interval = null;
                this.setTime(Math.floor(timeMs / 1000));
            },
            hide: function() {
                if (!this.visible) throw new Error("Tried to remove timer when it's not visible");
                if (this.interval) clearInterval(this.interval);
                this.element.remove();
                this.visible = false;
            }
        };
        this.timer.element.classList.add("timer");
    }

    addDatasets(petersonBarney, politicians) {
        if (this.#datasetAdded) return;

        this.#addVowelMeasurements(politicians, 1, d3.symbolDiamond, "80");

        this.#addVowelMeasurements(petersonBarney, 1, d3.symbolSquare, "A0", { fontWeight: 700 });

        this.visibleVowelsChoice = document.createElement("div"); // HTML grid with 3 columns
        this.visibleVowelsChoice.style = "display: grid; grid-template-columns: auto 35px 35px; gap: 0px";

        let h = append_h(this.visibleVowelsChoice, "<text class=serif>Język polski:</text>", 3);
        h.style = "grid-column-start: 1; grid-column-end: 4;";

        let div = document.createElement("div");
        div.style = "margin-top: auto; margin-bottom: auto;";
        this.checkboxes.push(append_checkbox(div, "<text class=serif>moje samogłoski</text>", (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 0);
        }, true));
        this.visibleVowelsChoice.appendChild(div);

        const svg1 = createCloudSVG("a", "#ff0000", "o", "#ff00ff", "y", "#964b00", 0, true, this.#representationsSelected[0][0]);
        svg1.element.addEventListener("click", () => {
            const choice = this.#representationsSelected[0][0] = !this.#representationsSelected[0][0];
            svg1.fill(choice);
            this.scatterPlot.getGroup(0).forEach(group => group[0].g.style("display", choice ? "block" : "none"));
        });
        this.visibleVowelsChoice.appendChild(svg1.element);

        let svg11 = createEllipseSVG(this.#representationsSelected[0][1]);
        svg11.element.addEventListener("click", () => {
            const choice = this.#representationsSelected[0][1] = !this.#representationsSelected[0][1];
            svg11.fill(choice);
            this.scatterPlot.getGroup(0).forEach(group => group[1].g.style("display", choice ? "block" : "none"));
        });
        this.visibleVowelsChoice.appendChild(svg11.element);
    
        h = append_h(this.visibleVowelsChoice, "Język angielski (General American):", 3);
        h.style = "grid-column-start: 1; grid-column-end: 4;";
        
        div = document.createElement("div");
        div.style = "margin-top: auto; margin-bottom: auto;";
        this.checkboxes.push(append_checkbox(div, "<i>moje samogłoski</i>", (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 3);
        }));
        this.visibleVowelsChoice.appendChild(div);

        const svg2 = createCloudSVG("ɑ", "#ff0060", "ɔ", "#ff00ff", "ɪ", "#006000", -2, false, this.#representationsSelected[1][0], "font-style: italic");
        svg2.element.addEventListener("click", () => {
            const choice = this.#representationsSelected[1][0] = !this.#representationsSelected[1][0];
            svg2.fill(choice);
            this.scatterPlot.getGroup(3).forEach(group => group[0].g.style("display", choice ? "block" : "none"));
        });
        this.visibleVowelsChoice.appendChild(svg2.element);

        const svg22 = createEllipseSVG(this.#representationsSelected[1][1]);
        svg22.element.addEventListener("click", () => {
            const choice = this.#representationsSelected[1][1] = !this.#representationsSelected[1][1];
            svg22.fill(choice);
            this.scatterPlot.getGroup(3).forEach(group => group[1].g.style("display", choice ? "block" : "none"));
        });
        this.visibleVowelsChoice.appendChild(svg22.element);

        div = document.createElement("div");
        div.style = "margin-top: auto; margin-bottom: auto;";
        this.checkboxes.push(append_checkbox(div, "<b>badanie Peterson & Barney, 1952</b>", (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 1);
        }));
        this.visibleVowelsChoice.appendChild(div);

        const svg3 = createCloudSVG("ɑ", "#ff0060", "ɔ", "#ff00ff", "ɪ", "#006000", -2, false, this.#representationsSelected[3][0], "font-weight: 700");
        svg3.element.addEventListener("click", () => {
            const choice = this.#representationsSelected[3][0] = !this.#representationsSelected[3][0];
            svg3.fill(choice);
            this.scatterPlot.getGroup(1).forEach(group => group[0].g.style("display", choice ? "block" : "none"));
        });
        this.visibleVowelsChoice.appendChild(svg3.element);

        const svg33 = createEllipseSVG(this.#representationsSelected[3][1]);
        svg33.element.addEventListener("click", () => {
            const choice = this.#representationsSelected[3][1] = !this.#representationsSelected[3][1];
            svg33.fill(choice);
            this.scatterPlot.getGroup(1).forEach(group => group[1].g.style("display", choice ? "block" : "none"));
        });
        this.visibleVowelsChoice.appendChild(svg33.element);

        div = document.createElement("div");
        div.style = "margin-top: auto; margin-bottom: auto;";
        this.checkboxes.push(append_checkbox(div, "nagrania polityków", (e) => {
            this.scatterPlot.setSeriesVisibility(e.target.checked, 2);
        }));
        this.visibleVowelsChoice.appendChild(div);

        const svg4 = createCloudSVG("ɑ", "#ff0060", "ɔ", "#ff00ff", "ɪ", "#006000", -2, false, this.#representationsSelected[2][0]);
        svg4.element.addEventListener("click", () => {
            const choice = this.#representationsSelected[2][0] = !this.#representationsSelected[2][0];
            svg4.fill(choice);
            this.scatterPlot.getGroup(2).forEach(group => group[0].g.style("display", choice ? "block" : "none"));
        });
        this.visibleVowelsChoice.appendChild(svg4.element);

        const svg44 = createEllipseSVG(this.#representationsSelected[2][1]);
        svg44.element.addEventListener("click", () => {
            const choice = this.#representationsSelected[2][1] = !this.#representationsSelected[2][1];
            svg44.fill(choice);
            this.scatterPlot.getGroup(2).forEach(group => group[1].g.style("display", choice ? "block" : "none"));
        });
        this.visibleVowelsChoice.appendChild(svg44.element);

        this.sideContainer.appendChild(this.visibleVowelsChoice);
        document.querySelector(".recording-container").after(this.visibleVowelsChoice);

        this.#datasetAdded = true;

        // uncheck the first checkbox and check second and third, along with running their callbacks
        this.checkboxes[0].checked = false;
        this.checkboxes[1].checked = true;
        this.checkboxes[2].checked = true;
        this.checkboxes[0].onchange({ target: { checked: false } });
        this.checkboxes[1].onchange({ target: { checked: true } });
        this.checkboxes[2].onchange({ target: { checked: true } });
    }

    #addVowelMeasurements(vowels, index, symbol, pointOpacity = "80", formatting = {}) {
        if (!symbol) throw new Error("Symbol must be provided.");
        if (!index) throw new Error("Index must be provided.");
        const vowelInv = VOWEL_INVENTORIES[vowels.language];
        this.scatterPlot.insertGroup({
            formatting: { symbol, ...formatting },
            nested: true
        }, index);
        for (let i = 0; i < vowelInv.length; i++) {
            const vowel = vowels.getVowelByLetter(new Vowel(vowelInv[i]).letter);
            const ids = this.scatterPlot.appendGroup({
                nested: true,
                formatting: { rgb: vowel.rgb },
                onClick: this.vowelClicked ? () => this.vowelClicked(vowel) : undefined
            }, index);
            
            const pointCloudIds = this.scatterPlot.appendGroup({
                formatting: {
                    size: POINT_SIZES.USER_DATAPOINTS * 0.7,
                    text: vowel.letter,
                    opacity: pointOpacity,
                }
            }, ids, vowels.getSingleMeasurements(vowel.letter));

            this.scatterPlot.setSeriesVisibility(this.#representationsSelected[this.#datasetCount][0], pointCloudIds);

            const ellipseIds = this.scatterPlot.appendGroup({}, ids);
            this.scatterPlot.addEllipse(vowel.confidenceEllipse, ellipseIds);
            
            this.scatterPlot.setSeriesVisibility(this.#representationsSelected[this.#datasetCount][1], ellipseIds);

            this.scatterPlot.appendGroup({
                formatting: {
                    size: POINT_SIZES.VOWEL_CENTROID * 0.7,
                    text: vowel.letter,
                    glow: true
                }
            }, ids, vowels.getCentroids(vowel.letter));
        }
        this.scatterPlot.setSeriesVisibility(false, 1);

        this.#datasetCount++
    }

    nextMessage() {
        if (this.#currentMessage == 0) {
            this.h2.innerHTML = `W dowolnym momencie, jeśli czujesz, że lepiej już wymawiasz te samogłoski, możesz przejść dalej do testu końcowego.`;
            this.button.innerHTML = "Przejdź dalej";
            this.#currentMessage++;
        } else if (this.#currentMessage == 1) {
            this.controller.next();
        }
    }

    destroy() {
        this.button.remove();
        this.visibleVowelsChoice?.remove();
        this.divStack.style = "";
    }
}

function createCloudSVG(letter1, color1, letter2, color2, letter3, color3, xoffset = 0, serif = false, selected = false, style) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "30");
    svg.setAttribute("height", "30");
    svg.classList.add("button")
    if (serif) svg.classList.add("serif");
    if (style) svg.style = style;

    // add text inside the square
    const text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text1.setAttribute("x", 12 + xoffset);
    text1.setAttribute("y", "20");
    text1.setAttribute("fill", selected ? color1 : "gray");
    text1.innerHTML = letter1;
    svg.appendChild(text1);

    const text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text2.setAttribute("x", "18");
    text2.setAttribute("y", "13");
    text2.setAttribute("fill", selected ? color2 : "gray");
    text2.innerHTML = letter2;
    svg.appendChild(text2);

    const text3 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text3.setAttribute("x", "5");
    text3.setAttribute("y", "13");
    text3.setAttribute("fill", selected ? color3 : "gray");
    text3.innerHTML = letter3;
    svg.appendChild(text3);

    return {
        element: svg,
        fill: function(set) {
            if (set) {
                text1.setAttribute("fill", color1);
                text2.setAttribute("fill", color2);
                text3.setAttribute("fill", color3);
            } else {
                text1.setAttribute("fill", "gray");
                text2.setAttribute("fill", "gray");
                text3.setAttribute("fill", "gray");
            }
        }
    }
}

function createEllipseSVG(selected = false) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "30");
    svg.setAttribute("height", "30");
    svg.classList.add("button");

    // add an ellipse
    let ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipse.setAttribute("cx", "15");
    ellipse.setAttribute("cy", "12");
    ellipse.setAttribute("rx", "10");
    ellipse.setAttribute("ry", "5");
    ellipse.setAttribute("transform", "rotate(-40 15 12)");
    ellipse.setAttribute("fill", "none");
    ellipse.setAttribute("stroke", selected ? "blue" : "gray");
    ellipse.setAttribute("stroke-width", "2");
    svg.appendChild(ellipse);
    return {
        element: svg,
        fill: function(set) {
            ellipse.setAttribute("stroke", set ? "blue" : "gray");
        }
    }
}
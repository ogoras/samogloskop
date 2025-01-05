export function createCloudSelector(letters, colors, xoffset = 0, serif = false, selected = false, style) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "30");
    svg.setAttribute("height", "30");
    svg.classList.add("button")
    if (serif) svg.classList.add("serif");
    if (style) svg.style = style;

    // add text inside the square
    const text1 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text1.setAttribute("x", 12 + xoffset);
    text1.setAttribute("y", "25");
    text1.setAttribute("fill", selected ? colors[0] : "gray");
    text1.innerHTML = letters[0];
    svg.appendChild(text1);

    const text2 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text2.setAttribute("x", "18");
    text2.setAttribute("y", "18");
    text2.setAttribute("fill", selected ? colors[1] : "gray");
    text2.innerHTML = letters[1];
    svg.appendChild(text2);

    const text3 = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text3.setAttribute("x", "5");
    text3.setAttribute("y", "18");
    text3.setAttribute("fill", selected ? colors[2] : "gray");
    text3.innerHTML = letters[2];
    svg.appendChild(text3);

    return {
        element: svg,
        fill: function(set) {
            if (set) {
                text1.setAttribute("fill", colors[0]);
                text2.setAttribute("fill", colors[1]);
                text3.setAttribute("fill", colors[2]);
            } else {
                text1.setAttribute("fill", "gray");
                text2.setAttribute("fill", "gray");
                text3.setAttribute("fill", "gray");
            }
        }
    }
}

export function createEllipseSelector(selected = false) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "30");
    svg.setAttribute("height", "30");
    svg.classList.add("button");

    // add an ellipse
    let ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipse.setAttribute("cx", "15");
    ellipse.setAttribute("cy", "15");
    ellipse.setAttribute("rx", "10");
    ellipse.setAttribute("ry", "5");
    ellipse.setAttribute("transform", "rotate(-40 15 15)");
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

export function createCentroidSelector(letter, color, serif = false, selected = false, style) {
    // this time, just use a simple text element
    const text = document.createElement("text");
    text.classList.add("button");
    text.innerHTML = letter;
    if (style) text.style = style;
    if (serif) {
        text.classList.add("serif");
        text.style.fontWeight = "700";
    }
    text.style.color = selected ? color : "gray";
    text.style.fontSize = "1.66em";
    text.style.textAlign = "center";

    return {
        element: text,
        fill: function(set) {
            text.style.color = set ? color : "gray";
        }
    }
}
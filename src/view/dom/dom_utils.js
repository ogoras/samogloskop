export function append_h4(parent, text) {
    const h4 = document.createElement("h4");
    h4.innerHTML = text;
    parent.appendChild(h4);
}

export function append_checkbox(parent, text, onchange, checked = false) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    input.onchange = onchange;
    parent.appendChild(input);
    const span = document.createElement("span");
    span.innerHTML = text;
    parent.appendChild(span);
}
export function append_h(parent, text, level = 1) {
    const h = document.createElement(`h${level}`);
    h.innerHTML = text;
    parent.appendChild(h);
    return h;
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
    return input;
}
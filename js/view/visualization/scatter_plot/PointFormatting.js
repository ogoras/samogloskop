export default class PointFormatting {
    symbol = d3.symbolCircle
    size = 64
    rgb = "000000"
    opacity = "ff"

    get color() {
        return `#${this.rgb}${this.opacity}`;
    }
    set color(value) {
        this.rgb = value.slice(0, 6);
        this.opacity = value.slice(6) || this.opacity;
    }

    constructor(params) {
        Object.assign(this, params);
    }

    copy() {
        return new PointFormatting(this);
    }

    update(params) {
        if (!params) return;
        for (let key of Object.keys(params)) {
            this[key] = params[key];
        }
    }
}
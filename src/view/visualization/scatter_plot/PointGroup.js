import PointFormatting from "./PointFormatting.js";

export default class PointGroup extends Array {
    defaultFormatting = new PointFormatting();

    constructor(...args) {
        if (args.length === 1 && typeof args[0] === "number") {
            super(...args);
            return;
        }
        super();
        if (this.constructor === PointGroup) {
            throw new Error("Cannot instantiate abstract class Group");
        } 
        const [parent, index, defaults] = args;
        this.parent = parent;
        if (parent.defaultFormatting) this.defaultFormatting = parent.defaultFormatting.copy();
        this.defaultFormatting.update(defaults?.formatting);
        this.capacity = defaults?.capacity;
        this.growSize = defaults?.growSize;
        this.x = parent.x;
        this.y = parent.y;
        this.element = this.g = parent.id ?
            parent.g.insert("g", `#${parent[index]?.id}`) :
            parent.g.append("g");
        this.id = parent.id ? `${parent.id}-${parent.length}` : "points";
        this.g.attr("id", this.id);
        this.applyFormatting(defaults?.formatting);
        if (defaults?.onClick) {
            this.g.attr("class", "clickable")
                .on("click", defaults.onClick);
        }
    }

    getAllPoints() {
        throw new Error(`getAllPoints is not implemented in ${this.constructor.name}`);
    }

    applyFormatting(formatting) {
        formatting = this.defaultFormatting.update(formatting);
        if (!formatting) return;
        if (formatting.color || formatting.rgb) {
            const color = formatting.color ?? `#${formatting.rgb}`;
            this.g.attr("fill", color)
                .attr("color", color);
        }
        if (formatting.opacity) {
            this.g.attr("fill-opacity", parseInt(formatting.opacity, 16) / 255);
        }
        if (formatting.fontWeight) {
            this.g.attr("font-weight", formatting.fontWeight);
        }
        if (formatting.italic) {
            this.g.attr("font-style", "italic");
        }
        if (formatting.serif) {
            this.g.attr("font-family", "Times New Roman, serif");
        }
    }

    setClickability(clickable) {
        if (clickable) {
            this.g.attr("class", "clickable");
        } else {
            this.g.attr("class", "");
        }
    }
}
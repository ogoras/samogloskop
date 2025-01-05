import { POINT_SIZES } from "../../../const/POINT_SIZES.js";
import PointGroup from "./PointGroup.js";
import remToPx from "../../../logic/util/remToPx.js";

export default class SimplePointGroup extends PointGroup {
    static count = 0;

    constructor(...args) {
        super(...args);
        this.id = SimplePointGroup.count++;
    }

    ellipse = null;

    addPoint(point, isTextPoint = point.isTextPoint ?? (this.defaultFormatting.text !== undefined)) {
        if (isTextPoint) {
            return this.addTextPoint(point);
        } else {
            return this.addSymbolPoint(point);
        }
    }

    addSymbolPoint(point) {
        const defaultFormatting = this.defaultFormatting;

        const symbol = point.symbol ?? defaultFormatting.symbol;
        let size = point.size ?? defaultFormatting.size;
        size = remToPx(size) / 12;

        const p = ({
            element: this.g.append("path")
                .attr("d", d3.symbol(symbol).size(size))
                .attr("transform", `translate(${this.x.scale(point.x)}, ${this.y.scale(point.y)})`),
            x: point.x,
            y: point.y,
            symbol,
            label: point.label ? this.g.append("text")
                .text(point.label)
                .attr("x", this.x.scale(point.x))
                .attr("y", this.y.scale(point.y))
                : null,
        });
        if (point.color) {
            p.element.attr("fill", point.color);
            p.label?.attr("fill", point.color);
        }
        if (this.capacity && this.length > this.capacity) {
            const removed = this.shift();
            removed.element.remove();
        }
        const pointCount = this.length;
        if (this.growSize) {
            this.forEach((point, i) => {
                point.element.attr("d", d3.symbol(point.symbol).size((i + 1) / pointCount * POINT_SIZES.TRAIL));
            });
        }
        this.push(p);
        return p;
    }

    addTextPoint(point) {
        const defaultFormatting = this.defaultFormatting;

        const text = point.text ?? defaultFormatting.text;
        let size = point.size ?? defaultFormatting.size;
        size /= 120;

        const p = ({
            element: this.g.append("text")
                .text(text)
                .attr("x", this.x.scale(point.x))
                .attr("y", this.y.scale(point.y))
                .attr("font-size", `${size}rem`),
            x: point.x,
            y: point.y,
            text
        });
        if (point.glow ?? defaultFormatting.glow) p.element.attr("class", "glow");
        if (point.color) {
            p.element.attr("fill", point.color);
        }
        if (this.capacity && this.length > this.capacity) {
            const removed = this.shift();
            removed.element.remove();
        }
        this.push(p);
        return p;
    }

    addEllipse(x, y, rx, ry = rx, angle = 0, opacity0, opacity1) {
        const fillGradientID = `ellipseGradient${this.id}`;
        const fillGradient = this.g.append("defs")
            .append("radialGradient")
            .attr("id", fillGradientID)
        fillGradient.append("stop")
            .attr("offset", "0%")
            .attr("style", `stop-color:#${this.defaultFormatting.rgb}; stop-opacity:${opacity0 ?? 0.8}`);
        fillGradient.append("stop")
            .attr("offset", "100%")
            .attr("style", `stop-color:#${this.defaultFormatting.rgb}; stop-opacity:${opacity1 ?? 0}`);
        const ellipse = {
            element: this.g.append("ellipse")
                .attr("cx", this.x.scale(x))
                .attr("cy", this.y.scale(y))
                .attr("rx", Math.abs(this.x.scale(rx) - this.x.scale(0)))
                .attr("ry", Math.abs(this.y.scale(ry) - this.y.scale(0)))
                .attr("transform", `rotate(${-angle} ${this.x.scale(x)} ${this.y.scale(y)})`)
                .attr("fill", `url(#${fillGradientID})`),
            x, y, rx, ry, angle
        };
        return this.ellipse = ellipse;
    }

    getAllPoints() {
        return this;
    }

    getAllEllipses() {
        return this.ellipse ? [this.ellipse] : [];
    }

    removeAll() {
        this.forEach(point => {
            point.element.remove();
            point.label?.remove();
        });
        this.length = 0;
        this.ellipse?.element.remove();
        this.ellipse = null;
    }
}
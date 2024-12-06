import { POINT_SIZES } from "../../../const/POINT_SIZES.js";
import PointGroup from "./PointGroup.js";
import remToPx from "../../../logic/util/remToPx.js";

export default class SimplePointGroup extends PointGroup {
    addPoint(point) {
        const defaultFormatting = this.defaultFormatting;

        const symbol = point.symbol ?? defaultFormatting.symbol;
        let size = point.size ?? defaultFormatting.size;
        size = remToPx(size) / 12

        const p = ({
            element: this.g.append("path")
                .attr("d", d3.symbol(symbol).size(size))
                .attr("transform", `translate(${this.x.scale(point.x)}, ${this.y.scale(point.y)})`),
            x: point.x,
            y: point.y,
            symbol: point.symbol ?? defaultFormatting.symbol,
            label: point.label ? this.g.append("text")
                .attr("font-weight", "bold")
                .attr("style", `text-shadow:${" 0 0 0.3em #fff,".repeat(5).slice(0, -1)}`)
                .attr("font-family", "Helvetica, sans-serif")
                .text(point.label)
                .attr("x", this.x.scale(point.x))
                .attr("y", this.y.scale(point.y) - 10)
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

    getAllPoints() {
        return this;
    }

    removeAllPoints() {
        this.forEach(point => {
            point.element.remove();
            point.label?.remove();
        });
        this.length = 0;
    }
}
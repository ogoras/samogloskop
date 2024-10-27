import PointGroup from "./PointGroup.js";

export default class SimplePointGroup extends PointGroup {
    addPoint(point) {
        let p = ({
            element: this.g.append("path")
                .attr("d", d3.symbol(point.symbol ?? d3.symbolCircle).size(point.size ?? 64))
                .attr("transform", `translate(${this.x.scale(point.x)}, ${this.y.scale(point.y)})`)
                .attr("fill", point.color ? point.color : "black"),
            x: point.x,
            y: point.y,
            label: point.label ? this.g.append("text")
                .attr("font-weight", "bold")
                .attr("style", `text-shadow:${" 0 0 0.3em #fff,".repeat(5).slice(0, -1)}`)
                .attr("font-family", "Helvetica, sans-serif")
                .text(point.label)
                .attr("x", this.x.scale(point.x))
                .attr("y", this.y.scale(point.y) - 10)
                .attr("fill", point.color ? point.color : "black") : null,
        });
        if (this.capacity && this.length > this.capacity) {
            let removed = this.shift();
            removed.element.remove();
        }
        let pointCount = this.length;
        if (this.growSize) {
            this.forEach((point, i) => {
                point.element.attr("r", (i + 1) / pointCount * 3);
            });
        }
        this.push(p);
        return p;
    }

    getAllPoints() {
        return this;
    }
}
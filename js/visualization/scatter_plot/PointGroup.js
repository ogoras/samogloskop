export default class PointGroup extends Array {
    points = [];

    constructor(...args) {
        if (args.length === 1 && typeof args[0] === "number") {
            super(...args);
            return;
        }
        super();
        let [parent, index] = args;
        this.parent = parent;
        this.x = parent.x;
        this.y = parent.y;
        this.element = this.g = parent.id ?
            parent.g.insert("g", `#${parent[index]?.id}`):
            parent.g.append("g");
        this.id = parent.id ? `${parent.id}-${parent.length}` : "points";
        console.log(this);
    }

    getOrCreateSubgroup(index) {
        if (this[index]) {
            return this[index];
        }
        if (index < 0 || index > this.length) {
            throw new Error(`getOrCreateSubgroup: index out of bounds: ${index}`);
        }
        let newGroup = new PointGroup(this, index);
        this.push(newGroup);
        return newGroup;
    }

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
        if (this.capacity && this.points.length > this.capacity) {
            let removed = this.points.shift();
            removed.element.remove();
        }
        let pointCount = this.points.length;
        if (this.growSize) {
            this.points.forEach((point, i) => {
                point.element.attr("r", (i + 1) / pointCount * 3);
            });
        }
        this.points.push(p);
        return p;
    }

    getAllPoints() {
        return this.points.concat(...this.map(subgroup => subgroup.getAllPoints()));
    }
}
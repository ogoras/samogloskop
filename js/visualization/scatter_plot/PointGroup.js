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
        let [parent, index, defaults] = args;
        this.parent = parent;
        if (parent.defaultFormatting) this.defaultFormatting = parent.defaultFormatting.copy();
        this.defaultFormatting.update(defaults?.formatting);
        this.capacity = defaults?.capacity;
        this.growSize = defaults?.growSize;
        this.x = parent.x;
        this.y = parent.y;
        this.element = this.g = parent.id ?
            parent.g.insert("g", `#${parent[index]?.id}`):
            parent.g.append("g");
        this.id = parent.id ? `${parent.id}-${parent.length}` : "points";
    }

    getAllPoints() {
        throw new Error(`getAllPoints is not implemented in ${this.constructor.name}`);
    }
}
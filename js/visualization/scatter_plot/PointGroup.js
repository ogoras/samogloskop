export default class PointGroup extends Array {
    constructor(parent, index = parent.length ?? 0) {
        super();
        this.parent = parent;
        this.element = this.g = parent.id ?
            parent.g.insert("g", `#${parent[index]?.id}`):
            parent.g.append("g");
        this.id = parent.id ? `${parent.id}-${index}` : "points";
        console.log(this);
    }

    getOrCreate(index) {
        if (this[index]) {
            if (!(this[index] instanceof PointGroup)) {
                throw new Error(`PointGroup[${index}] already exists and is not a PointGroup`);
            }
            return this[index];
        }
        let newGroup = new PointGroup(this, index);
        this[index] = newGroup;
        return newGroup;
    }
}
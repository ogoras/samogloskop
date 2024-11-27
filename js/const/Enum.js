export default class Enum {
    constructor(index, name) {
        this.index = index;
        this.name = name;
    }

    toString() {
        return this.name;
    }
}
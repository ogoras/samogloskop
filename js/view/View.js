import Singleton from "../Singleton.js";

export default class View {
    constructor(parent) {
        // super();

        if (this.constructor === View) throw new Error("Cannot instantiate abstract class View");
        if (!parent || typeof parent !== "object") throw new Error("Parent must be an object");
        this.parent = parent;
    }
}
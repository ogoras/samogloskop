import Singleton from "../../Singleton.js";

export default class Controller extends Singleton {
    constructor() {
        super();

        if (this.constructor === Controller) {
            throw new Error("Controller is an abstract class and cannot be instantiated directly.");
        }
    }

    init() {
        throw new Error(`${this.constructor.name} must implement init()`);
    }
}
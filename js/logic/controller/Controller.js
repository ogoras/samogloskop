import Singleton from "../../Singleton.js";

export default class Controller extends Singleton {
    get state () {
        return this.sm.state;
    }

    get stateName() {
        return this.sm.state.name;
    }

    constructor() {
        super();

        if (this.constructor === Controller) {
            throw new Error("Controller is an abstract class and cannot be instantiated directly.");
        }
    }

    init({sm, lsm}) {
        this.sm = sm;
        this.lsm = lsm;
    }
}
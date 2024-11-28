export default class Enum {
    static #instancesDict = {};

    constructor(index, name) {
        Enum.#instancesDict[this.constructor.name] ??= {};
        this.index = index;
        Enum.#instancesDict[this.constructor.name][index] = this;
        this.name = name;
        Enum.#instancesDict[this.constructor.name][name] = this;
    }

    static get(key) {
        let instance = Enum.#instancesDict[this.name][key];
        return instance;
    }

    toString() {
        return this.name;
    }

    next() {
        let nextIndex = this.index + 1;
        let nextInstance = Enum.#instancesDict[this.constructor.name][nextIndex];
        if (nextInstance === undefined) {
            throw new Error(`No next instance for ${this}`);
        }
        return nextInstance;
    }
}
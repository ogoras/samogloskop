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
        return Enum.#instancesDict[this.name][key];
    }

    toString() {
        return this.name;
    }

    next() {
        const nextIndex = this.index + 1;
        const nextInstance = Enum.#instancesDict[this.constructor.name][nextIndex];
        if (nextInstance === undefined) {
            throw new Error(`No next instance for ${this}`);
        }
        return nextInstance;
    }
}
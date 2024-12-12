export default class Enum {
    static #instancesDict = {};
    index;
    name;
    constructor(index, name, ...args) {
        Enum.#instancesDict[this.constructor.name] ??= {};
        this.index = index;
        Enum.#instancesDict[this.constructor.name][index] = this;
        this.name = name;
        Enum.#instancesDict[this.constructor.name][name] = this;
    }
    static get(key) {
        const instance = Enum.#instancesDict[this.name]?.[key];
        if (instance === undefined)
            throw new Error(`No instance found for ${key}`);
        return instance;
    }
    toString() {
        return this.name;
    }
    next() {
        const nextIndex = this.index + 1;
        const nextInstance = Enum.#instancesDict[this.constructor.name]?.[nextIndex];
        if (nextInstance === undefined) {
            throw new Error(`No next instance for ${this}`);
        }
        return nextInstance;
    }
}

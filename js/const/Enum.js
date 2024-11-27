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
        if (!instance) {
            throw new Error(`No ${this.name} instance found for key ${key}`);
        }
        return instance;
    }

    toString() {
        return this.name;
    }
}
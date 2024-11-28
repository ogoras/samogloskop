export default class Singleton {
    static #instancesDict = {};
    static #isInternalConstructing = false;

    constructor() {
        if (!Singleton.#isInternalConstructing) {
            throw new Error("Singleton class. Use getInstance() method to get the single instance of this class.");
        }
        Singleton.#isInternalConstructing = false;
    }

    static getInstance() {
        Singleton.#isInternalConstructing = true;
        Singleton.#instancesDict[this.name] ??= new this();
        return Singleton.#instancesDict[this.name];
    }
}
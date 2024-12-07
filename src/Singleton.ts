export default class Singleton {
    static #instancesDict : {[index: string]: Singleton} = {};
    static #isInternalConstructing = false;

    public constructor() {
        if (!Singleton.#isInternalConstructing) {
            throw new Error(`${this.constructor.name} is a Singleton class. Use getInstance() method to get the single instance of this class.`);
        }
        Singleton.#isInternalConstructing = false;
    }

    static getInstance<T extends typeof Singleton>(this: T) : InstanceType<T> {
        Singleton.#isInternalConstructing = true;
        Singleton.#instancesDict[this.name] ??= new this() as InstanceType<T>;
        return Singleton.#instancesDict[this.name] as InstanceType<T>;
    }
}
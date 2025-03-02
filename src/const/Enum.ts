export default class Enum {
    static #instancesDict: {[index: string]: {
        [index: string | number]: Enum;
    }} = {};
    index: number;
    name: string;

    constructor(index: number, name: string, ...args: any[]) {
        Enum.#instancesDict[this.constructor.name] ??= {};
        this.index = index;
        Enum.#instancesDict[this.constructor.name]![index] = this;
        this.name = name;
        Enum.#instancesDict[this.constructor.name]![name] = this;
    }

    static get<T extends typeof Enum>(this: T, key: string | number): InstanceType<T>  {
        const instance = Enum.#instancesDict[this.name]?.[key];
        if (instance === undefined) throw new Error(`No instance found for ${key}`);
        return instance as InstanceType<T>;
    }

    static get_optional<T extends typeof Enum>(this: T, key: string | number): InstanceType<T> | undefined {
        return Enum.#instancesDict[this.name]?.[key] as InstanceType<T> | undefined;
    }

    toString() {
        return this.name;
    }

    next<T extends Enum>(this: T): T {
        const nextIndex = this.index + 1;
        const nextInstance = Enum.#instancesDict[this.constructor.name]?.[nextIndex];
        if (nextInstance === undefined) {
            throw new Error(`No next instance for ${this}`);
        }
        return nextInstance as T;
    }
}
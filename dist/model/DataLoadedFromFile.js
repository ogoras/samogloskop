export const DataLoadedFromFile = SubclassLoadedFromFile();
export default DataLoadedFromFile;
export class ArrayLoadedFromFile extends SubclassLoadedFromFile(Array) {
    map(...args) {
        // return Array instead of ArrayLoadedFromFile
        return Array.from(this).map(...args);
    }
    flatMap(...args) {
        return Array.from(this).flatMap(...args);
    }
}
export function SubclassLoadedFromFile(Parent) {
    if (Parent === undefined)
        Parent = Object;
    return class SubclassLoadedFromFile extends Parent {
        loaded = false;
        #loading = false;
        constructor(...args) {
            super(...args);
            if (this.constructor === SubclassLoadedFromFile) {
                throw new Error(`${this.constructor.name ??
                    `SubclassLoadedFromFile extends ${Parent.name}`} is an abstract class and cannot be instantiated directly`);
            }
        }
        static async create(callback, ...args) {
            const instance = new this(...args);
            await instance.load();
            callback?.();
            return instance;
        }
        async load() {
            if (this.#loading) {
                await new Promise(resolve => {
                    const interval = setInterval(() => {
                        if (!this.#loading) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 10);
                });
            }
            else if (!this.loaded) {
                this.#loading = true;
                await this._load();
                this.loaded = true;
                this.#loading = false;
            }
        }
        async _load() {
            throw new Error(this.constructor.name + "._load() not implemented");
        }
    };
}

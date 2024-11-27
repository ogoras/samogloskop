import { VERSION_MAJOR, VERSION_MINOR } from "../const/version.js";
import getState from "../const/states.js";

export default class LocalStorageMediator {
    static instance = null;
    static #isInternalConstructing = false;

    constructor() {
        if (!LocalStorageMediator.#isInternalConstructing) {
            throw new Error("Singleton class. Use getInstance() method to get the single instance of this class.");
        }
        LocalStorageMediator.#isInternalConstructing = false;

        for (let prop of localStorageProperties) {
            Object.defineProperty(this, prop.name, {
                get() {
                    if (this.#cache[prop.name] === undefined) {
                        let item = localStorage.getItem(prop.localStorageName);
                        if (prop.customGet) {
                            item = prop.customGet(item);
                        }
                        this.#cache[prop.name] = item;
                    }
                    return this.#cache[prop.name];
                },
                set(value) {
                    if (value === undefined) {
                        delete this.#cache[prop.name];
                        localStorage.removeItem(prop.localStorageName);
                    } else {
                        this.#cache[prop.name] = value;
                        localStorage.setItem(prop.localStorageName, prop.customSet ? prop.customSet(value) : value);
                    }
                }
            });
        }
    }

    static getInstance() {
        LocalStorageMediator.#isInternalConstructing = true;
        LocalStorageMediator.instance ??= new LocalStorageMediator();
        return LocalStorageMediator.instance;
    }

    #cache = {};

    load() {
        let dataConsentGiven = this.dataConsentGiven;
        if (dataConsentGiven && !this.version) {
            this.version = "0.0";
        }
        let localStorageVersion = this.version;
        if (localStorageVersion !== `${VERSION_MAJOR}.${VERSION_MINOR}`) {
            if (localStorageVersion === "0.1") {
                // 0.1 -> 0.2 conversion
                if (this.state === "DONE") this.state = "CONFIRM_VOWELS";
            }
            else if (dataConsentGiven) {
                // for now, local storage v0.0 is not supported
                // TODO: implement a conversion mechanism for versions 1.x and higher
                console.log(`Conversion not implemented for version ${localStorageVersion}`, "color: red;");
                localStorage.clear();
                dataConsentGiven = false;
            }
        }
        let preset = this.preset;
        let state = this.state;
        let intensityStatsString = this.intensityStatsString;
    }

    clear() {
        localStorage.clear();
        this.#cache = {};
    }
}

const localStorageProperties = [
    {
        name: "dataConsentGiven",
        localStorageName: "accepted",
    },
    {
        name: "version",
        localStorageName: "version",
    },
    {
        name: "preset",
        localStorageName: "preset",
        customGet: getState,
        customSet: (value) => value.toString(),
    },
    {
        name: "state",
        localStorageName: "state",
        customGet: getState,
        customSet: (value) => value.toString(),
    },
    {
        name: "intensityStatsString",
        localStorageName: "intensityStats",
    },
    {
        name: "userVowelsString",
        localStorageName: "userVowels",
    }
]
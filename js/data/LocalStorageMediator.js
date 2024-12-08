import { VERSION_MAJOR, VERSION_MINOR } from "../const/version.js";
import State from "../const/states.js";
import Preset from "../const/presets.js";
import Singleton from "../Singleton.js";
import IntensityStats from "./IntensityStats.js";
import SpeakerVowels from "./vowels/SpeakerVowels.js";

const GATHERING_NATIVE_LEGACY = [
    "WAITING_FOR_VOWELS",
    "GATHERING_VOWELS",
    "CONFIRM_VOWELS",
].map((key) => State.get(key));

export default class LocalStorageMediator extends Singleton {
    constructor() {
        super();

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
                        if (prop.name !== "dataConsentGiven" && this.dataConsentGiven) {
                            localStorage.setItem(prop.localStorageName, prop.customSet ? prop.customSet(value) : value);
                        }
                        else if (prop.name === "dataConsentGiven" && value) {
                            localStorage.setItem(prop.localStorageName, prop.customSet ? prop.customSet(value) : value);
                            // go through all cached properties and set them in local storage
                            for (let key of Object.keys(this.#cache)) {
                                if (key !== "dataConsentGiven") {
                                    this[key] = this.#cache[key];
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    #cache = {};

    load() {
        let dataConsentGiven = this.dataConsentGiven;
        if (dataConsentGiven && !this.version) {
            this.version = "0.0";
        }
        const localStorageVersion = this.version;
        if (localStorageVersion !== `${VERSION_MAJOR}.${VERSION_MINOR}`) {
            switch(localStorageVersion) {
                case "0.1":
                    // 0.1 -> 0.2 conversion
                    if (this.state.is?.("DONE")) this.state = State.get("CONFIRM_VOWELS");
                // FALL THROUGH
                case "0.2":
                    // 0.2 -> 0.3 conversion
                    if (GATHERING_NATIVE_LEGACY.includes(this.state)) {
                        this.state = State.get("SPEECH_MEASURED");
                    }
                    // try to get nativeVowels under the name userVowels
                    if (!this.nativeVowels) {
                        const nativeVowelsString = localStorage.getItem("userVowels");
                        if (nativeVowelsString) {
                            this.nativeVowels = SpeakerVowels.fromString(nativeVowelsString);
                            localStorage.removeItem("userVowels");
                        }
                    }
                    break;
                default:
                    if (dataConsentGiven) {
                        console.log(`%cConversion not implemented for version ${localStorageVersion}`, "color: red;");
                        localStorage.clear();
                        dataConsentGiven = false;
                    }
            }
        }
        this.version = `${VERSION_MAJOR}.${VERSION_MINOR}`;

        if (!dataConsentGiven) {
            this.clear();
            this.state = State.get("DATA_CONSENT");
        } else if (this.state === undefined || this.preset === undefined) {
            this.state = State.get("PRESET_SELECTION");
        } else if (this.intensityStats === undefined && this.state.after("NO_SAMPLES_YET")) {
            this.state = State.get("NO_SAMPLES_YET");
        } else if (this.nativeVowels === undefined && this.state.after("GATHERING_NATIVE")) {
            this.state = State.get("SPEECH_MEASURED");
        } else if (this.foreignInitial === undefined && this.state.after("GATHERING_FOREIGN_INITIAL")) {
            this.state = State.get("GATHERING_FOREIGN_INITIAL");
        } else if (this.foreignRepeat === undefined && this.state.after("GATHERING_FOREIGN_REPEAT")) {
            this.state = State.get("GATHERING_FOREIGN_REPEAT");
        }
    }

    clear() {
        localStorage.clear();
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
        customGet: (key) => Preset.get(key),
        customSet: (value) => value.toString(),
    },
    {
        name: "state",
        localStorageName: "state",
        customGet: (key) => State.get(key),
        customSet: (value) => value.toString(),
    },
    {
        name: "intensityStats",
        localStorageName: "intensityStats",
        customGet: (string) => string ? IntensityStats.fromString(string) : string,
        customSet: (value) => value.toString(),
    },
    {
        name: "nativeVowels",
        localStorageName: "nativeVowels",
        customGet: (string) => string ? SpeakerVowels.fromString(string) : string,
        customSet: (value) => value.toString(),
    },
    {
        name: "foreignInitial",
        localStorageName: "foreignInitial",
        customGet: (string) => string ? SpeakerVowels.fromString(string, "EN", false) : string,
        customSet: (value) => value.toString(),
    },
    {
        name: "foreignRepeat",
        localStorageName: "foreignRepeat",
        customGet: (string) => string ? SpeakerVowels.fromString(string, "EN", false) : string,
        customSet: (value) => value.toString(),
    }
]
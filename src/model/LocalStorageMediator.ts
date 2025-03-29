import { VERSION_PATCH, VERSION_MAJOR, VERSION_MINOR } from "../const/version.js";
import State from "../const/State.js";
import Preset from "../const/Preset.js";
import Singleton from "../Singleton.js";
import IntensityStats from "./IntensityStats.js";
import SpeakerVowels from "./vowels/SpeakerVowels.js";
import nullish from "../logic/util/nullish.js";

const GATHERING_NATIVE_LEGACY = [
    "WAITING_FOR_VOWELS",
    "GATHERING_VOWELS",
    "CONFIRM_VOWELS",
];

export default class LocalStorageMediator extends Singleton {
    [index: string]: any;

    #dateToString(date : Date) {
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }

    constructor() {
        super();

        for (let prop of localStorageProperties) {
            Object.defineProperty(this, prop.name, {
                get() {
                    if (this.#cache[prop.name] === undefined) {
                        let item: any = localStorage.getItem(prop.localStorageName);
                        if (prop.customGet) {
                            item = prop.customGet(item);
                        }
                        this.#cache[prop.name] = item;
                        if (!localStorage.getItem(prop.localStorageName) && this.dataConsentGiven) {
                            if (nullish(item)) return;
                            localStorage.setItem(prop.localStorageName, item);
                        }
                    }
                    return this.#cache[prop.name];
                },
                set(value) {
                    if (nullish(value)) {
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
                        } else if (prop.name === "dataConsentGiven" && !value) {
                            localStorage.clear();
                        }
                    }
                }
            });
        }
    }

    getTimeSpentForToday() {
        const date = new Date();
        const todayString = this.#dateToString(date);
        return this.timeSpentInTraining?.[todayString] ?? 0;
    }

    setTimeSpentForToday(time: number) {
        const date = new Date();
        const todayString = this.#dateToString(date);
        const timeSpentCopy = this.timeSpentInTraining ?? {};
        timeSpentCopy[todayString] = time;
        this.timeSpentInTraining = timeSpentCopy;
    }

    #cache = {};

    load() {
        let dataConsentGiven = this.dataConsentGiven;
        if (!this.version) {
            this.version = "0.0";
        }
        const localStorageVersion = this.version;
        // check if the local storage version has one or two dots
        const LSVersionNumbers = localStorageVersion.split(".");
        const LSVersionMajor = parseInt(LSVersionNumbers[0]);
        const LSVersionMinor = parseInt(LSVersionNumbers[1]);

        if (LSVersionMajor !== VERSION_MAJOR || LSVersionMinor !== VERSION_MINOR) {
            switch(`${LSVersionMajor}.${LSVersionMinor}`) {
                case "0.1":
                    // 0.1 -> 0.2 conversion
                    if (this.state.is?.("DONE")) this.state = State.get("CONFIRM_VOWELS");
                // FALL THROUGH
                case "0.2":
                    // 0.2 -> 0.3 conversion
                    if (GATHERING_NATIVE_LEGACY.includes(localStorage.getItem("state") ?? "")) {
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
                // FALL THROUGH
                case "0.3": // 0.3 -> 0.4 conversion is not necessary
                case "0.4": // 0.4 -> 0.5 conversion not necessary either
                case "0.5": // 0.5 -> 1.0 conversion, same thing
                case "1.0": // 1.0 -> 1.1 ditto
                case "1.1": // 1.1 -> 1.2 
                case "1.2": // 1.2 -> 1.3
                    // attribute all time spent so far to the current day
                    const timeSpentSoFar = localStorage.getItem("timeSpentInTraining");
                    if (timeSpentSoFar) {
                        const timeSpentSoFarInt = parseInt(timeSpentSoFar);
                        if (!isNaN(timeSpentSoFarInt)) {
                            const date = new Date();
                            const todayString = this.#dateToString(date);
                            this.timeSpentInTraining = { [todayString]: timeSpentSoFarInt };
                            console.log(this.timeSpentInTraining);
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
        this.version = `${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}`;

        if (!dataConsentGiven) {
            this.clear();
            this.state = State.get("DATA_CONSENT");
        } else if (nullish(this.state) || nullish(this.preset)) {
            this.state = State.get("PRESET_SELECTION");
        } else if (nullish(this.intensityStats) && this.state.after("NO_SAMPLES_YET")) {
            this.state = State.get("NO_SAMPLES_YET");
        } else if (nullish(this.nativeVowels) && this.state.after("GATHERING_NATIVE")) {
            this.state = State.get("SPEECH_MEASURED");
        } else if (nullish(this.foreignInitial) && this.state.after("GATHERING_FOREIGN_INITIAL")) {
            this.state = State.get("GATHERING_FOREIGN_INITIAL");
        } else if (nullish(this.foreignRepeat) && this.state.after("GATHERING_FOREIGN_REPEAT")) {
            this.state = State.get("GATHERING_FOREIGN_REPEAT");
        }
    }

    clear() {
        localStorage.clear();
    }

    getJSON() {
        let object: {[index: string]: any} = {};
        for (let prop of localStorageProperties) {
            object[prop.name] = this[prop.name]?.compact?.() ?? this[prop.name];
        }
        return JSON.stringify(object);
    }

    saveToFile(filename: string) {
        const json = this.getJSON();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    loadFromFile() {
        // show a dialog to select a file
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = () => {
            const file = input.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const json = reader.result as string;
                    this.loadFromJSON(json);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    loadFromJSON(json: string) {
        const object = JSON.parse(json);
        for (let prop of localStorageProperties) {
            if (nullish(object[prop.name])) this[prop.name] = object[prop.name];
            else if (prop.customLoad) this[prop.name] = prop.customLoad(object[prop.name]);
            else this[prop.name] = prop.customGet ? prop.customGet(JSON.stringify(object[prop.name])) : object[prop.name];
        }

        location.reload();
    }
}

const localStorageProperties = [
    {
        name: "dataConsentGiven",
        localStorageName: "accepted",
        customGet: (string: string) => string === "true",
    },
    {
        name: "version",
        localStorageName: "version",
    },
    {
        name: "preset",
        localStorageName: "preset",
        customGet: (key: string) => Preset.get_optional(key),
        customSet: (value: Preset | {index: number}) => {
            if (!(value instanceof Preset)) value = Preset.get(value.index);
            return value.toString();
        },
        customLoad: (object: any) => Preset.get(object.index),
    },
    {
        name: "state",
        localStorageName: "state",
        customGet: (key: string) => State.get_optional(key),
        customSet: (value: State | {index: number}) => {
            if (!(value instanceof State)) value = State.get(value.index);
            return value.toString();
        },
        customLoad: (object: any) => State.get(object.index),
    },
    {
        name: "intensityStats",
        localStorageName: "intensityStats",
        customGet: (string: string) => string ? IntensityStats.fromString(string) : string,
        customSet: (value: IntensityStats) => value.toString(),
    },
    {
        name: "nativeVowels",
        localStorageName: "nativeVowels",
        customGet: (string: string) => string ? SpeakerVowels.fromString(string) : string,
        customSet: (value: SpeakerVowels) => value.toString(),
    },
    {
        name: "foreignInitial",
        localStorageName: "foreignInitial",
        customGet: (string: string) => string ? SpeakerVowels.fromString(string, "EN", false) : string,
        customSet: (value: SpeakerVowels) => value.toString(),
    },
    {
        name: "foreignRepeat",
        localStorageName: "foreignRepeat",
        customGet: (string: string) => string ? SpeakerVowels.fromString(string, "EN", false) : string,
        customSet: (value: SpeakerVowels) => value.toString(),
    },
    {
        name: "timeSpentInTraining",
        localStorageName: "timeSpentInTraining",
        customGet: JSON.parse,
        customSet: JSON.stringify,
    },
    {
        name: "isControlGroup",
        localStorageName: "isControlGroup",
        customGet: (string?: string) => {
            // the control group functionality probably deprecated
            return false;
            // string ??= Math.random() < 0.2 ? "true" : "false";  // roughly 20% of users are in the control group
            // return string === "true";
        }
    },
    {
        name: "microphoneLabel",
        localStorageName: "microphoneLabel"
    }
]
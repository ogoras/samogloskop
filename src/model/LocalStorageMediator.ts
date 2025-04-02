import { VERSION_PATCH, VERSION_MAJOR, VERSION_MINOR } from "../const/version.js";
import State from "../const/enum/State.js";
import Preset from "../const/enum/Preset.js";
import Singleton from "../Singleton.js";
import IntensityStats from "./IntensityStats.js";
import SpeakerVowels from "./vowels/SpeakerVowels.js";
import nullish from "../logic/util/nullish.js";
import DAILY_TARGET from "../const/TIME.js";

const GATHERING_NATIVE_LEGACY = [
    "WAITING_FOR_VOWELS",
    "GATHERING_VOWELS",
    "CONFIRM_VOWELS",
];

export default class LocalStorageMediator extends Singleton {
    [index: string]: any;

    dateToString(date : Date) {
        return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
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

    getTimeSpentForToday(nullIsZero = true) {
        const date = new Date();
        const todayString = this.dateToString(date);
        const result = this.timeSpentInTraining?.[todayString]
        return nullIsZero ? (result ?? 0) : result;
    }

    setTimeSpentForToday(time: number) {
        const date = new Date();
        const todayString = this.dateToString(date);
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
        // will work whether the local storage version has one or two dots
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
                case "0.3":
                case "0.4":
                case "0.5":
                case "1.0":
                case "1.1":
                case "1.2": // 0.3 ... 1.2 -> 1.3 conversion
                    // attribute all time spent so far to March 29th, 2025 (date when 1.3 was released)
                    const timeSpentSoFar = localStorage.getItem("timeSpentInTraining");
                    if (timeSpentSoFar) {
                        const timeSpentSoFarInt = parseInt(timeSpentSoFar);
                        if (!isNaN(timeSpentSoFarInt)) {
                            const todayString = "2025-2-29"; // Account for the month adjustment
                            this.timeSpentInTraining = { [todayString]: timeSpentSoFarInt };
                            console.log(this.timeSpentInTraining);
                        }
                    }
                // FALL THROUGH
                case "1.3": // 1.3 -> 1.4 conversion
                    for (let propName of ["nativeVowels", "foreignInitial", "foreignRepeat"]) {
                        const prop = localStorage.getItem(propName);
                        if (prop) {
                            const prop_object = JSON.parse(prop);
                            // set processedAt to current datetime
                            prop_object.processedAt = new Date();
                            localStorage.setItem(propName, JSON.stringify(prop_object));
                        }
                    }
                // FALL THROUGH
                case "1.4": // 1.4 -> 1.5 conversion
                    // for all keys in timeSpentSoFar, replace the month with a number one bigger
                    const timeSpent = localStorage.getItem("timeSpentInTraining");
                    if (timeSpent) {
                        const timeSpentCopy = JSON.parse(timeSpent);
                        const newTimeSpent: {[index: string]: number} = {};
                        for (let key in timeSpentCopy) {
                            const ymd = key.split("-");
                            if (ymd.length !== 3) throw new Error(`Invalid date format: ${key}`);
                            const date = new Date(parseInt(ymd[0]!), parseInt(ymd[1]!), parseInt(ymd[2]!));
                            const newKey = this.dateToString(date);
                            newTimeSpent[newKey] = timeSpentCopy[key];
                        }
                        this.timeSpentInTraining = newTimeSpent;
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

    howManyFullDays() {
        const timeSpent = this.timeSpentInTraining;
        if (!timeSpent) return 0;
        let days = 0;
        for (let key in timeSpent) {
            if (timeSpent[key] >= DAILY_TARGET * 1000) {
                days++;
            }
        }
        return days;
    }

    getFullDaysMessage(bold = false) {
        const days = this.howManyFullDays();
        const boldOpen = bold ? "<b>" : "";
        const boldClose = bold ? "</b>" : "";
        const message = `Masz za sobą ${boldOpen + days + boldClose} w pełni przećwiczon`;
        const lastDigit = days % 10;
        const lastTwoDigits = days % 100;
        const isTeen = lastTwoDigits >= 10 && lastTwoDigits <= 19;
        if (days === 1) {
            return message + "y dzień.";
        } else if (lastDigit >= 2 && lastDigit <= 4 && !isTeen) {
            return message + "e dni.";
        } else {
            return message + "ych dni.";
        }
    }

    canFinish() {
        const fullDays = this.howManyFullDays();
        if (fullDays >= 9) return true;
        else if (fullDays >= 6 || this.isControlGroup) {
            const dateOfPreTest = this.foreignInitial.processedAt;
            const earliestDate = new Date(dateOfPreTest.getFullYear(), dateOfPreTest.getMonth(), dateOfPreTest.getDate() + 8);
            const today = new Date();
            
            return today >= earliestDate;
        }
        else return false;
    }

    willBeAbleToFinishToday() {
        if (this.getTimeSpentForToday() >= DAILY_TARGET * 1000 || this.isControlGroup) return this.canFinish();

        const fullDays = this.howManyFullDays();
        if (fullDays >= 8) return true;
        else if (fullDays >= 5) {
            const dateOfPreTest = this.foreignInitial.processedAt;
            const earliestDate = new Date(dateOfPreTest.getFullYear(), dateOfPreTest.getMonth(), dateOfPreTest.getDate() + 8);
            const today = new Date();
            
            return today >= earliestDate;
        }
        else return false;
    }

    getStreak() {
        const timeSpent = this.timeSpentInTraining;
        let streak = 0;
        let date = new Date();

        // add today to streak if it is over the target
        if (timeSpent[this.dateToString(date)] >= DAILY_TARGET * 1000) streak++;

        date = new Date(date.getTime() - 86400000);
        while (timeSpent[this.dateToString(date)] >= DAILY_TARGET * 1000) {
            streak++;
            date = new Date(date.getTime() - 86400000);
        }

        return streak;
    }

    getStreakString(grammaticalCase : string = "nominative") {
        const streak = this.getStreak();
        let singular;
        switch(grammaticalCase) {
            case "nominative":
                singular = "dzień";
                break;
            case "genitive":
                singular = "dnia";
                break;
            default:
                throw new Error(`Unsupported grammatical case: ${grammaticalCase}`);
        }
        return `${streak} ${streak == 1 ? singular : "dni"}`;
    }
}

function createObjectProperty(name : string, Constructor : typeof SpeakerVowels | typeof IntensityStats = SpeakerVowels, foreign = false) {
    return {
        name,
        localStorageName: name,
        customGet: (string: string) => string ? Constructor.fromString(string, foreign ? "EN" : undefined, foreign ? false : undefined) : string,
        customSet: (value: SpeakerVowels | IntensityStats) => value.toString(),
    }
}

function createEnumProperty(name: string, Constructor: typeof State | typeof Preset) {
    return {
        name,
        localStorageName: name,
        customGet: (key: string) => Constructor.get_optional(key),
        customSet: (value: State | Preset | {index: number}) => {
            if (!(value instanceof Constructor)) value = Constructor.get(value.index);
            return value.toString();
        },
        customLoad: (object: any) => Constructor.get(object.index),
    };
}

const localStorageProperties : Array<{
    name: string,
    localStorageName: string,
    customGet?: (string: string) => any,
    customSet?: (value: any) => string,
    customLoad?: (object: any) => any,
}> = [
    {
        name: "dataConsentGiven",
        localStorageName: "accepted",
        customGet: (string: string) => string === "true",
    },
    {
        name: "version",
        localStorageName: "version",
    },
    createEnumProperty("preset", Preset),
    createEnumProperty("state", State),
    createObjectProperty("intensityStats", IntensityStats),
    createObjectProperty("nativeVowels"),
    createObjectProperty("foreignInitial", SpeakerVowels, true),
    createObjectProperty("foreignCurrent", SpeakerVowels, true),
    createObjectProperty("foreignRepeat", SpeakerVowels, true),
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
            // // the control group functionality probably deprecated
            // return false;
            string ??= Math.random() < 0.2 ? "true" : "false";  // roughly 20% of users are in the control group
            return string === "true";
        }
    },
    {
        name: "microphoneLabel",
        localStorageName: "microphoneLabel"
    }
]
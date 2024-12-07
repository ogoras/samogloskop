import arrToObj from "../logic/util/arrToObj.js";
import arrObjToObjArr from "../logic/util/arrObjToObjArr.js";

const LANGUAGES = ["EN", "PL"]

export type IPA_type = {broad: string, narrow?: string};

type inventoryTransposed = {
    IPA: IPA_type,
    rgb?: string[],
    letter?: string[],
    language: string
};

export type vowel = {
    IPA: {broad: string, narrow?: string},
    rgb?: string,
    letter?: string,
    language: string
}
type inventory = vowel[];

let VOWEL_DICTS: {[index: string]: {[index: string]: number}} = {};
let VOWEL_INVENTORIES: {[index: string]: vowel[]} = {};
let VOWEL_DATA: {[index: string]: inventoryTransposed} = {};

async function readInventories() {
    for (let language of LANGUAGES) {
        let response = await fetch(`./data/vowel_inventories/${language}.json`)
        let dataEntry = await response.json();
        dataEntry = {...dataEntry, language};
        VOWEL_DATA[language] = dataEntry;
        VOWEL_DICTS[language] = arrToObj(dataEntry.letter ?? dataEntry.IPA.broad);
        VOWEL_INVENTORIES[language] = arrObjToObjArr(dataEntry) as vowel[];
    }
}

await readInventories();

export { VOWEL_INVENTORIES, VOWEL_DICTS, VOWEL_DATA };
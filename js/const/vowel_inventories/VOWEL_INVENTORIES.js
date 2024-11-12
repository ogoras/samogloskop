import arrToObj from "../../util/arrToObj.js";
import arrObjToObjArr from "../../util/arrObjToObjArr.js";

const LANGUAGES = ["EN", "PL"]

let VOWEL_DICTS = {};
let VOWEL_INVENTORIES = {};
let data = {};

async function readInventories() {
    for (let language of LANGUAGES) {
        let response = await fetch(`./js/const/vowel_inventories/${language}.json`)
        let dataEntry = await response.json();
        dataEntry = {...dataEntry, language};
        data[language] = dataEntry;
        VOWEL_DICTS[language] = arrToObj(dataEntry.letter ?? dataEntry.IPA.broad);
        VOWEL_INVENTORIES[language] = arrObjToObjArr(dataEntry);
    }
}

await readInventories();

export { VOWEL_INVENTORIES, VOWEL_DICTS };
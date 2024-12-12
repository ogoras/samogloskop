import ChoiceView from "./ChoiceView.js";
import Preset from '../../const/presets.js';

const noticeText = `Wybierz kategorię, która najbardziej do Ciebie pasuje. Pamiętaj, aby kierować się charakterystyką swojego głosu, więc np. dla chłopca po mutacji najpewniej sprawdzi się opcja <q>mężczyzna</q>, niezależnie od wieku. <h3>Jestem:</h3>`;
const choices = [
    {
        text: "kobietą",
        returnValue: Preset.get("FEMALE")
    },
    {
        text: "mężczyzną",
        returnValue: Preset.get("MALE")
    },
    {
        text: "dzieckiem",
        returnValue: Preset.get("CHILD")
    }
]


export default class PresetView extends ChoiceView {
    constructor(controller, parentView, selectedPreset, extraAction) {
        super(controller, noticeText, choices, parentView, selectedPreset, extraAction);
    }
}
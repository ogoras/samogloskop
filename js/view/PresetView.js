import ChoiceView from "./ChoiceView.js";
import PRESETS from '../const/presets.js';

const noticeText = `Wybierz kategorię, która najbardziej do Ciebie pasuje. Pamiętaj, aby kierować się charakterystyką swojego głosu, więc np. dla chłopca po mutacji najpewniej sprawdzi się opcja <q>mężczyzna</q>, niezależnie od wieku. <h3>Jestem:</h3>`;
const choices = [
    {
        text: "mężczyzną",
        updates: { preset: PRESETS.MALE }
    },
    {
        text: "kobietą",
        updates: { preset: PRESETS.FEMALE }
    },
    {
        text: "dzieckiem",
        updates: { preset: PRESETS.CHILD }
    }
]


export default class PresetView extends ChoiceView {
    constructor(onStateChange) {
        super(onStateChange, noticeText, choices);
    }
}
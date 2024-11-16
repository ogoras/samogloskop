import TextGrid from './TextGrid.js';

export default class Recording {
    constructor(path) {
        this.path = path;
    }

    async load() {
        let textGrid = new TextGrid(`${this.path}.TextGrid`);
        try {
            await textGrid.load();
        }
        catch {
            textGrid = new TextGrid(`${this.path}.textgrid`, "utf-8");
            await textGrid.load();
        }
        // console.log(textGrid);
    }
}
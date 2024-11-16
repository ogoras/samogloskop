import TextGrid from './TextGrid.js';

export default class Recording {
    constructor(path) {
        this.path = path;
    }

    async load() {
        let textGrid = new TextGrid(`${this.path}.TextGrid`);
        await textGrid.load();
        // console.log(textGrid);
    }
}
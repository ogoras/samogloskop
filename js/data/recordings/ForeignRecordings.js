export default class ForeignRecordings {
    loaded = false;

    constructor(language = "EN", callback) {
        this.language = language;
        this.load(callback);
    }

    async load(callback) {
        // TODO

        this.loaded = true;
        callback?.();
    }
}
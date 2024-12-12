import { assertEqualOnLine, assertStartsWithOnLine, assertEqualWithMargin, assertEqual } from "../../logic/util/asserts.js";
import { ArrayLoadedFromFile } from "../DataLoadedFromFile.js";
export default class TextGrid extends ArrayLoadedFromFile {
    static singleIndent = " ".repeat(4);
    #indentationLevel = 0;
    get indentationLevel() {
        return this.#indentationLevel;
    }
    set indentationLevel(level) {
        this.#indentationLevel = level;
        this.indent = TextGrid.singleIndent.repeat(level);
    }
    constructor(path) {
        super();
        this.path = path;
    }
    static async create(path, callback) {
        return await super.create(callback, path);
    }
    async _load() {
        const errors = [];
        const encodings = ["utf-16be", "utf-8"];
        for (let encoding of encodings) {
            try {
                await this.#loadWithEncoding(encoding);
                return;
            }
            catch (e) {
                errors.push(e);
            }
        }
        throw new Error(`Failed to load TextGrid from ${this.path}. Tried encodings: ${encodings}. Errors: ${errors}`);
    }
    async #loadWithEncoding(encoding = "utf-16be") {
        this.lineNumber = 0;
        this.indentationLevel = 0;
        let text = await fetch(this.path);
        text = await text.arrayBuffer();
        text = new TextDecoder(encoding).decode(text);
        // iterate over lines, ignore whitespace-only lines
        this.lines = text.split("\n")
            .map(line => line.trimEnd())
            .filter(line => line.length > 0);
        ;
        this.#checkLine("File type = \"ooTextFile\"");
        this.#checkLine("Object class = \"TextGrid\"");
        this.#checkLine("xmin = 0");
        this.duration = this.#readPropertyFromLine("xmax", parseFloat);
        this.#checkLine("tiers? <exists>");
        this.length = this.#readPropertyFromLine("size", parseInt);
        this.#checkLine("item []:");
        this.indentationLevel++;
        for (let j = 0; j < this.length; j++) {
            const tier = this[j] = [];
            this.#checkLine(`item [${j + 1}]:`);
            this.indentationLevel++;
            this.#checkLine("class = \"IntervalTier\"");
            tier.name = this.#readPropertyFromLine("name", stripQuotes);
            this.#checkLine("xmin = 0");
            assertEqualWithMargin(this.#readPropertyFromLine("xmax"), this.duration);
            tier.length = this.#readPropertyFromLine("intervals: size", parseInt);
            for (let k = 0; k < tier.length; k++) {
                const interval = this[j][k] = {};
                this.#checkLine(`intervals [${k + 1}]:`);
                this.indentationLevel++;
                interval.xmin = this.#readPropertyFromLine("xmin", parseFloat);
                interval.xmax = this.#readPropertyFromLine("xmax", parseFloat);
                interval.text = this.#readPropertyFromLine("text", stripQuotes);
                interval.translation = this.#readPropertyFromLine("translation", stripQuotes, true);
                if (interval.translation === undefined)
                    delete interval.translation;
                if (interval.text.endsWith("?")) {
                    interval.text = interval.text.slice(0, -1);
                    interval.uncertain = true;
                }
                else
                    interval.uncertain = false;
                this.indentationLevel--;
            }
            this.indentationLevel--;
        }
        this.indentationLevel--;
        this.lines = null;
        assertEqual(this[0].name, "phonemes");
        assertEqual(this[1].name, "words");
        assertEqual(this[2].name, "phrases");
    }
    #checkLine(expected) {
        assertEqualOnLine(this.lines, this.lineNumber++, this.indent + expected);
    }
    #readPropertyFromLine(key, parseFunction, optional = false) {
        if (optional) {
            if (!this.lines[this.lineNumber]?.startsWith(`${this.indent}${key} = `)) {
                return undefined;
            }
        }
        else {
            assertStartsWithOnLine(this.lines, this.lineNumber, `${this.indent}${key} = `);
        }
        parseFunction ??= x => x;
        return parseFunction(this.lines[this.lineNumber++].split(" = ")[1]);
    }
    getVowelIntervals(vowelSymbols) {
        return this[0].filter(interval => vowelSymbols.includes(interval.text));
    }
    getPhonemesIn({ xmin, xmax }) {
        return this[0].filter(interval => interval.xmin >= xmin && interval.xmax <= xmax);
    }
    getWordIntervalAt(time) {
        return this[1].find(interval => interval.xmin <= time && time < interval.xmax);
    }
    getPhraseIntervalAt(time) {
        return this[2].find(interval => interval.xmin <= time && time < interval.xmax);
    }
}
function stripQuotes(text) {
    return text.trim().slice(1, -1);
}

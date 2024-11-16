import { assertEqualOnLine, assertStartsWithOnLine, assertEqualWithMargin } from "../util/asserts.js";

export default class TextGrid extends Array {
    static singleIndent = " ".repeat(4);

    loaded = false;
    indent = "";
    lineNumber = 0;
    #indentationLevel = 0;

    get indentationLevel() {
        return this.#indentationLevel;
    }

    set indentationLevel(level) {
        this.#indentationLevel = level;
        this.indent = TextGrid.singleIndent.repeat(level);
    }

    constructor(path, encoding = "utf-16be") {
        super();
        this.path = path;
        this.encoding = encoding;
    }

    async load() {
        let text = await fetch(this.path);
        text = await text.arrayBuffer();
        text = new TextDecoder(this.encoding).decode(text);

        // iterate over lines, ignore whitespace-only lines
        this.lines = text.split("\n")
            .map(line => line.trimEnd())
            .filter(line => line.length > 0);;

        this.checkLine("File type = \"ooTextFile\"");
        this.checkLine("Object class = \"TextGrid\"");
        this.checkLine("xmin = 0");

        this.duration = this.readPropertyFromLine("xmax", parseFloat);

        this.checkLine("tiers? <exists>");

        this.length = this.readPropertyFromLine("size", parseInt);

        this.checkLine("item []:");
        this.indentationLevel++;
        for (let j = 0; j < this.length; j++) {
            this[j] = [];
            this.checkLine(`item [${j + 1}]:`);
            this.indentationLevel++;
            this.checkLine("class = \"IntervalTier\"");
            this[j].name = this.readPropertyFromLine("name", stripQuotes);
            this.checkLine("xmin = 0");
            assertEqualWithMargin(this.readPropertyFromLine("xmax"), this.duration);
            this[j].length = this.readPropertyFromLine("intervals: size", parseInt);
            for (let k = 0; k < this[j].length; k++) {
                this[j][k] = {};
                this.checkLine(`intervals [${k + 1}]:`);
                this.indentationLevel++;
                this[j][k].xmin = this.readPropertyFromLine("xmin", parseFloat);
                this[j][k].xmax = this.readPropertyFromLine("xmax", parseFloat);
                this[j][k].text = this.readPropertyFromLine("text", stripQuotes);
                this.indentationLevel--;
            }
            this.indentationLevel--;
        }
        this.indentationLevel--;
        this.lines = null;
        this.loaded = true;
    }

    checkLine(expected) {
        assertEqualOnLine(this.lines, this.lineNumber++, this.indent + expected);
    }

    readPropertyFromLine(key, parseFunction) {
        assertStartsWithOnLine(this.lines, this.lineNumber, `${this.indent}${key} = `);
        parseFunction ??= x => x;
        return parseFunction(this.lines[this.lineNumber++].split(" = ")[1]);
    }
}

function stripQuotes(text) {
    return text.trim().slice(1, -1);
}
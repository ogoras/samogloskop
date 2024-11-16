import { assertEqualOnLine, assertStartsWithOnLine, assertEqualWithMargin } from "../util/asserts.js";

export default class TextGrid extends Array {
    static singleIndent = " ".repeat(4);

    loaded = false;
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

    async load () {
        let lastError;
        for (let encoding of ["utf-16be", "utf-8"]) {
            try {
                await this.loadWithEncoding(encoding);
                return;
            }
            catch (e) {
                lastError = e;
            }
        }
        throw new Error(`Failed to load TextGrid from ${this.path}. Last error: ${lastError}`);
    }

    async loadWithEncoding(encoding = "utf-16be") {
        this.lineNumber = 0;
        this.indentationLevel = 0;
        
        let text = await fetch(this.path);
        text = await text.arrayBuffer();
        text = new TextDecoder(encoding).decode(text);

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
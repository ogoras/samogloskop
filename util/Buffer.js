export class Buffer {
    buffer = [];

    constructor(capacity) {
        this.capacity = capacity;
    }

    push(data) {
        this.buffer.push(data);
        if (this.buffer.length > this.capacity) this.buffer.shift();
    }

    pushMultiple(data) {
        try {
            this.buffer.push(...data);
        } 
        catch (err) {
            if (!(err instanceof RangeError)) throw err;
            for (let d of data) this.buffer.push(d);
        }
        if (this.buffer.length > this.capacity) this.buffer.splice(0, this.buffer.length - this.capacity);
    }

    get length() {
        return this.buffer.length;
    }
    
    getCopy() {
        return [...this.buffer];
    }

    clear() {
        this.buffer = [];
    }

    getLastElements(n) {
        return this.buffer.slice(-n);
    }

    getLastElement() {
        return this.buffer[this.buffer.length - 1];
    }
}
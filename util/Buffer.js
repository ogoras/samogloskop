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
        this.buffer.push(...data);
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
}
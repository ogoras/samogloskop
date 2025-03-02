export default class Buffer<T> {
    buffer: T[] = [];
    capacity: number;

    get fillLevel() {
        return this.buffer.length / this.capacity;
    }

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    push(data: T) {
        this.buffer.push(data);
        if (this.buffer.length > this.capacity) return this.buffer.shift();
        else return null;
    }

    pushMultiple(data: T[]) {
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

    getLastElements(n: number) {
        return this.buffer.slice(-n);
    }

    getLastElement() {
        return this.buffer[this.buffer.length - 1];
    }
}
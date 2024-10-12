export function choose(array, n) {
    let result = [];
    for (let i = 0; i < n; i++) {
        let index = Math.floor(Math.random() * array.length);
        result.push(array.splice(index, 1)[0]);
    }
    return result;
}
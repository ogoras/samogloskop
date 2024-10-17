export function arrToObj(arr) {
    return arr.reduce((dict, key) => ({ ...dict, [key]: Object.keys(dict).length}), {});
}
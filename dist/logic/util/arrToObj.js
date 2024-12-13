export default function arrToObj(arr, constructor = (index) => index, ...additionalArrays) {
    return arr.reduce((acc, key, i) => ({ ...acc, [key]: constructor(i, key, ...additionalArrays.map((array) => array[i])) }), {});
}

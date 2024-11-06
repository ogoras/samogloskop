export default function arrToObj(arr, property) {
    return arr.reduce((acc, element) => 
        ({ ...acc, [property ? element[property] : element]: Object.keys(acc).length}),
    {});
}
export default function arrObjToObjArr(arrObj: any) {
    // console.log(arrObj);
    const objArr: {[index: string]: any}[] = [];
    for (let [key, values] of Object.entries(arrObj)) {
        if (!Array.isArray(values)) {
            if (typeof values === 'object') {
                values = arrObjToObjArr(values);
            } else {
                values = Array(objArr.length).fill(values); // TODO: figure out length properly
            }
        }
        const valuesAsArray = values as any[];
        for (let i = 0; i < valuesAsArray.length; i++) {
            if (!objArr[i]) objArr[i] = {};
            objArr[i]![key] = valuesAsArray[i];
        }
    }
    // console.log(objArr);
    return objArr;
}
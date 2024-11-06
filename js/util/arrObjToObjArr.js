export default function arrObjToObjArr(arrObj) {
    // console.log(arrObj);
    let objArr = [];
    for (let [key, values] of Object.entries(arrObj)) {
        if (!Array.isArray(values)) {
            if (typeof values === 'object') {
                values = arrObjToObjArr(values);
            } else {
                values = Array(objArr.length).fill(values); // TODO: figure out length properly
            }
        }
        for (let i = 0; i < values.length; i++) {
            if (!objArr[i]) objArr[i] = {};
            objArr[i][key] = values[i];
        }
    }
    // console.log(objArr);
    return objArr;
}
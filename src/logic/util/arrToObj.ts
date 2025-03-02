type constructorType = (index: number, key: string, ...rest: any[]) => any;

export default function arrToObj(arr: string[], constructor: constructorType = (index: number) => index, ...additionalArrays : any[][]) {
    return arr.reduce((acc, key, i) => 
        ({ ...acc, [key]: constructor(i, key, ...additionalArrays.map((array) => array[i])) }),
    {});
}
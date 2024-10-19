// let vowels = {
//     a : { F1: 800, F2: 1300, color: "rgb(255, 0, 0)" },
//     e : { F1: 660, F2: 1600, color: "rgb(250, 165, 0)" },
//     i : { F1: 300, F2: 2300, color: "rgb(0, 200, 0)" },
//     o : { F1: 580, F2: 900, color: "rgb(255, 0, 255)" },
//     u : { F1: 320, F2: 630, color: "rgb(0, 0, 255)"  },
//     y : { F1: 480, F2: 1750, color: "rgb(150, 75, 0)" }
// }
import { Vowel } from "../data/Vowel.js";

export const vowels = [
    new Vowel("a", {broad: "a", narrow: "ä"}, "#ff0000"),
    new Vowel("e", {broad: "ɛ", narrow: "ɛ"}, "#faa500"),
    new Vowel("i", {broad: "i", narrow: "i"}, "#00c800"),
    new Vowel("o", {broad: "ɔ", narrow: "ɔ"}, "#ff00ff"),
    new Vowel("u", {broad: "u", narrow: "u"}, "#0000ff"),
    new Vowel("y", {broad: "ɨ", narrow: "ɘ"}, "#964b00")
]
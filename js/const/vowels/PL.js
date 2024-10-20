// let vowels = {
//     a : { F1: 800, F2: 1300, color: "rgb(255, 0, 0)" },
//     e : { F1: 660, F2: 1600, color: "rgb(250, 165, 0)" },
//     i : { F1: 300, F2: 2300, color: "rgb(0, 200, 0)" },
//     o : { F1: 580, F2: 900, color: "rgb(255, 0, 255)" },
//     u : { F1: 320, F2: 630, color: "rgb(0, 0, 255)"  },
//     y : { F1: 480, F2: 1750, color: "rgb(150, 75, 0)" }
// }
import { Vowel } from "../../data/Vowel.js";

export const vowels = [
    new Vowel({broad: "a", narrow: "ä"}, "a", "#ff0000"),
    new Vowel({broad: "ɛ", narrow: "ɛ"}, "e",  "#faa500"),
    new Vowel({broad: "i", narrow: "i"}, "i", "#00c800"),
    new Vowel({broad: "ɔ", narrow: "ɔ"}, "o", "#ff00ff"),
    new Vowel({broad: "u", narrow: "u"}, "u", "#0000ff"),
    new Vowel({broad: "ɨ", narrow: "ɘ"}, "y", "#964b00")
]
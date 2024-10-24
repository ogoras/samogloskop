import Vowel from './Vowel.js';
import { VOWELS_PER_LANGUAGE } from '../const/vowels/vowels.js';

export default class Vowels {
    constructor(language, dataset) {
        if (!VOWELS_PER_LANGUAGE[language]) throw new Error(`Language ${language} not supported`);
        this.vowels = VOWELS_PER_LANGUAGE[language];
    }
}
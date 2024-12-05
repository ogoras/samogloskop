export const VERSION_MAJOR = 0,
    VERSION_MINOR = 3,  // will only change when the data format changes
    PATCH = 0;  // will change only with published commits, the in-beetween development versions are not counted

// v0.0: introduced localStorage
// v0.1: added Lobanov scaling
// v0.2.0: new states: CONFIRM_VOWELS, INITIAL_FOREIGN, TRAINING, REPEAT_FOREIGN (_FOREIGN states not implemented yet)
// v0.2.1: fixed a bug with Unknown state: TRAINING
// v0.3.0: States and presets stored as integers are also supported, GATHERING_NATIVE is now a single state
//          userVowels renamed to nativeVowels, added foreignInitial and foreignRepeat
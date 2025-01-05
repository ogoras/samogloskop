export const VERSION_MAJOR = 0,
    VERSION_MINOR = 4,  // will only change when the data format changes
    PATCH = 5;  // will change only with published commits, the in-beetween development versions are not counted

// v0.0: Introduced localStorage
// v0.1: Added Lobanov scaling
// v0.2.0: New states: CONFIRM_VOWELS, INITIAL_FOREIGN, TRAINING, REPEAT_FOREIGN (_FOREIGN states not implemented yet)
// v0.2.1: Fixed a bug with Unknown state: TRAINING
// v0.3.0: States and presets stored as integers are also supported, GATHERING_NATIVE is now a single state
//          userVowels renamed to nativeVowels, added foreignInitial and foreignRepeat
// v0.3.1: Moved codebase to TypeScript, fixed some potential bugs
// v0.3.2: All states finished, GitHub Actions setup
// v0.3.3: Moved privacy.html to the public folder, making it visible again
// v0.3.4: Credits page added
// v0.3.5: Fixed an application breaking bug with PresetView
// v0.3.6: Added the link to the survey
// v0.4.0: Time is now tracked during state TRAINING
// v0.4.1: Fixed timer alignment after clicking settings
// v0.4.2: Recalibrating integrated with training and gathering foreign states
// v0.4.3: Updated privacy policy
// v0.4.4: Switched from plotting geometric shapes to letters
// v0.4.5: Added MDN credits
export const VERSION_MAJOR = 1,
    VERSION_MINOR = 5,  // will only change when the data format changes
    VERSION_PATCH = 0;  // will change only with published commits, the in-beetween development versions are not counted

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
// v0.4.6: Added representation selectors for centroids, point clouds and ellipses
// v0.4.7: English vowels can be clicked and that highlights the vowel on top of Polish vowels
// v0.4.8: Some bug fixes
// v0.5.0: Local storage stores PATCH as well

// v1.0.0: Added the list of words, the first version to be tested with users
// v1.0.1: Font adjustments
// v1.0.2: Added SVG graphics in /public/svg/
// v1.1.0: Control group marker added
// v1.1.1: GatheringForeign confirmation for each vowel
// v1.1.2: Fixed bugs relating to the above, disabled noise supression and echo cancellation
// v1.2.0: Microphone device name is now stored in the local storage
// v1.2.1: Updated information about Donald Trump
// v1.2.2: Added the Youtube instruction video, removed outdated link to the survey
// v1.2.3: Disabled control group functionality
// v1.3.0: timeSpent is now tracked day-wise
// v1.3.1: Implemented saving and loading
// v1.4.0: Added an option to re-test at any point during training, re-added control group, timing all app use
// v1.4.1: Allow different microphoneLabels
// v1.4.2: Save new microphoneLabel
// v1.4.3: Timer now visible in all RecordingViews
// v1.5.0: Per-day times visible, month number now stored properly
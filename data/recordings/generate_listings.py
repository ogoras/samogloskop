import os, json

lang_dirs = os.listdir('recordings')

for lang_dir in lang_dirs:
    # skip files
    if not os.path.isdir(os.path.join('recordings', lang_dir)):
        continue
    speaker_dirs = os.listdir(os.path.join('recordings', lang_dir))
    with open(os.path.join('recordings', lang_dir, 'listing.json'), 'w') as f:
        json.dump(speaker_dirs, f)
    for speaker_dir in speaker_dirs:
        recordings = os.listdir(os.path.join('recordings', lang_dir, speaker_dir))
        with open(os.path.join('recordings', lang_dir, speaker_dir, 'listing.json'), 'w') as f:
            json.dump(recordings, f)
    
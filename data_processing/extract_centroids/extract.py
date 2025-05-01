import os, json, numpy as np

def extract_centroids(lang, folder_endings, which_vowels, output_filename, just_experimental=False):
    with open(f"./public/data/vowel_inventories/{lang}.json", encoding="utf-8") as f:
        vowel_inv = json.load(f)

    letter_to_broad = {}

    if lang == "PL":
        letter_to_broad = {letter: broad for letter, broad in zip(vowel_inv["letter"], vowel_inv["IPA"]["broad"])}

    output = {symbol: [] for symbol in vowel_inv["IPA"]["broad"]}

    for folder_ending in folder_endings:
        dir = f"./data/results_input{folder_ending}"
        for file in os.listdir(dir):
            if not file.endswith(".json"):
                continue
            
            n = file.split(".")[0]
            try:
                n = int(n)
            except ValueError:
                continue

            with open(f"{dir}/{file}", encoding="utf-8") as f:
                json_file = json.load(f)

            vowels_processed = json_file[which_vowels]["vowelsProcessed"]

            if just_experimental and json_file["isControlGroup"]:
                continue

            for vowel in vowels_processed:
                symbol = vowel["letter"]

                if lang == "PL":
                    symbol = letter_to_broad[symbol]

                centroid = np.zeros(2)
                count = 0
                for measurement in vowel["formants"]:
                    centroid[0] += measurement["y"]
                    centroid[1] += measurement["x"]
                    count += 1
                centroid /= count

                output[symbol].append({
                    "F1" : centroid[0],
                    "F2" : centroid[1]
                })

    with open(f"./public/data/vowel_measurements/{lang}/{output_filename}.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False)

# Extract native:
# extract_centroids("PL", ["", "_phases1&2"], "nativeVowels", "my_study")

# Extract foreignInitial for phase 3 experimental group:
extract_centroids("EN", [""], "foreignInitial", "my_study_E3_experimental_pre", True)
# And foreignRepeat -,,-
extract_centroids("EN", [""], "foreignRepeat", "my_study_E3_experimental_post", True)

# Extract foreignInitial for all phases and groups:
extract_centroids("EN", ["", "_phases1&2"], "foreignInitial", "my_study_all_phases_pre")
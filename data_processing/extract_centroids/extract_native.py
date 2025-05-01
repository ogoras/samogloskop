import os, json, numpy as np

with open("./public/data/vowel_inventories/PL.json", encoding="utf-8") as f:
    PL = json.load(f)

letter_to_broad = {letter: broad for letter, broad in zip(PL["letter"], PL["IPA"]["broad"])}
output = {symbol: [] for symbol in PL["IPA"]["broad"]}

for folder_ending in ['', '_phases1&2']:
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
            vowels_processed = json.load(f)["nativeVowels"]["vowelsProcessed"]

        for vowel in vowels_processed:
            symbol = letter_to_broad[vowel["letter"]]

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

with open("./public/data/vowel_measurements/PL/my_study.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False)

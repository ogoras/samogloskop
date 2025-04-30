import pandas as pd, numpy as np

distances_data = pd.read_csv('./data/distances_self.csv')

vowels = 'iɪɛæɑʌɔʊu'

distance_means_per_vowel = np.zeros(9)
distance_stds_per_vowel = np.zeros(9)
counts_per_vowel = np.zeros(9)

distance_mean = 0
distance_std = 0
count = 0

def calculate_means_and_stds(data = distances_data):
    global distance_means_per_vowel, distance_stds_per_vowel, counts_per_vowel, distance_mean, distance_std, count

    n = len(data)

    for i in range(n):
        row = data.iloc[i]
        vowel = row['vowel']
        vowel_index = vowels.index(vowel)

        distance = np.sqrt(row['distance_to_target'])
        distance_means_per_vowel[vowel_index] += distance
        distance_mean += distance
        counts_per_vowel[vowel_index] += 1
        count += 1

    distance_means_per_vowel = distance_means_per_vowel / counts_per_vowel
    distance_mean = distance_mean / count

    for i in range(n):
        row = data.iloc[i]
        vowel = row['vowel']
        vowel_index = vowels.index(vowel)

        distance = np.sqrt(row['distance_to_target'])
        distance_stds_per_vowel[vowel_index] += (distance - distance_means_per_vowel[vowel_index]) ** 2
        distance_std += (distance - distance_mean) ** 2

    distance_stds_per_vowel = np.sqrt(distance_stds_per_vowel / counts_per_vowel)
    distance_std = np.sqrt(distance_std / count)

def print_table_rows(data, _):
    global distance_means_per_vowel, distance_stds_per_vowel, counts_per_vowel, distance_mean, distance_std, count

    calculate_means_and_stds(data)

    for vowel_index in range(9):
        print(f'{distance_means_per_vowel[vowel_index]:.2f}'.replace('.', ','), end=' & ')
    print(f'{distance_mean:.2f}'.replace('.', ','), end='')
    
def is_int(value):
    try:
        int(value)
        return True
    except ValueError:
        return False
    
print_table_rows(distances_data[[x in ['Trump'] for x in distances_data['no']]], 'self_distances_table')
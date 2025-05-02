import pandas as pd, numpy as np

FOLDER_ENDING = ''

distances_data = pd.read_csv(f'./data/results_output{FOLDER_ENDING}/distances.csv')
speaker_data = pd.read_csv(f'./data/results_output{FOLDER_ENDING}/speakers.csv')

vowels = 'iɪɛæɑʌɔʊu'

# Three dimensional array 9x2x2 [vowel, controlGroup?, pretest?]
distance_means_per_vowel = np.zeros((9, 2, 2))
counts_per_vowel = np.zeros((9, 2, 2))

# across all vowels
distance_means = np.zeros((2, 2))
counts = np.zeros((2, 2))

# iterate over all records in the distances data
for i in range(len(distances_data)):
    row = distances_data.iloc[i]
    vowel = row['vowel']
    vowel_index = vowels.index(vowel)
    isPreTest = 1 if row['isPre'] else 0

    speaker_id = row['no']
    speaker_row = speaker_data[speaker_data['no'] == speaker_id]
    isControlGroup = 1 if speaker_row['isControlGroup'].item() else 0

    distance = np.sqrt(row['distance_to_target'])
    distance_means_per_vowel[vowel_index, isControlGroup, isPreTest] += distance
    distance_means[isControlGroup, isPreTest] += distance
    counts_per_vowel[vowel_index, isControlGroup, isPreTest] += 1
    counts[isControlGroup, isPreTest] += 1

# calculate means
distance_means_per_vowel = distance_means_per_vowel / counts_per_vowel
distance_means = distance_means / counts

distance_stds_per_vowel = np.zeros((9, 2, 2))
distance_stds = np.zeros((2, 2))

# iterate again
for i in range(len(distances_data)):
    row = distances_data.iloc[i]
    vowel = row['vowel']
    vowel_index = vowels.index(vowel)
    isPreTest = 1 if row['isPre'] else 0

    speaker_id = row['no']
    speaker_row = speaker_data[speaker_data['no'] == speaker_id]
    isControlGroup = 1 if speaker_row['isControlGroup'].item() else 0
    
    distance = np.sqrt(row['distance_to_target'])
    distance_stds_per_vowel[vowel_index, isControlGroup, isPreTest] += (distance - distance_means_per_vowel[vowel_index, isControlGroup, isPreTest]) ** 2
    distance_stds[isControlGroup, isPreTest] += (distance - distance_means[isControlGroup, isPreTest]) ** 2

# calculate stds
distance_stds_per_vowel = np.sqrt(distance_stds_per_vowel / counts_per_vowel)
distance_stds = np.sqrt(distance_stds / counts)

def print_table():
    # Okay, now let's make it into a LaTeX table
    # Save it to a file
    with open(f'./data/results_output{FOLDER_ENDING}/distances_table.tex', 'w', encoding="utf-8") as f:
        f.write('\\begin{table}[htbp]\n')
        f.write('\t\\caption{Statystyki odległości Mahalanobisa poszczególnych samogłosek}\n')
        f.write('\t\\label{tab:distances}\n')
        f.write('\t\\centering\n')
        f.write('\t\\begin{tabular}{|c|c|c||*{10}{c|}}\n')
        f.write('\t\t\\hline\n')
        f.write('\t\tGr. & Test & Wartość ')
        for i in range(9):
            f.write(f'& {vowels[i]} ')
        f.write('& Razem \\\\\\hline\\hline\n')

        for isControlGroup in [1, 0]:
            group_name = 'Kontrolna' if isControlGroup == 1 else 'Badawcza'
            f.write('\t\t\\multirow{4}{*}{\\begin{sideways}' + group_name + '\\end{sideways}} & \\multirow{2}{*}{Pre-test} & $\\overline{\\mathbf{d_M}}$ ')
            for i in range(9):
                f.write(f'& \\textbf{{{distance_means_per_vowel[i, isControlGroup, 1]:.2f}}} '.replace('.', ','))
            f.write(f'& \\textbf{{{distance_means[isControlGroup, 1]:.2f}}} \\\\\\cline{{3-13}}\n'.replace('.', ','))
            f.write('\t\t& & $\\sigma$ ')
            for i in range(9):
                f.write(f'& {distance_stds_per_vowel[i, isControlGroup, 1]:.2f} '.replace('.', ','))
            f.write(f'& {distance_stds[isControlGroup, 1]:.2f} \\\\\\cline{{2-13}}\n'.replace('.', ','))

            f.write('\t\t& \\multirow{2}{*}{Post-} & $\\overline{\\mathbf{d_M}}$ ')
            for i in range(9):
                f.write(f'& \\textbf{{{distance_means_per_vowel[i, isControlGroup, 0]:.2f}}} '.replace('.', ','))
            f.write(f'& \\textbf{{{distance_means[isControlGroup, 0]:.2f}}} \\\\\\cline{{3-13}}\n'.replace('.', ','))
            f.write('\t\t& & $\\sigma$ ')
            for i in range(9):
                f.write(f'& {distance_stds_per_vowel[i, isControlGroup, 0]:.2f} '.replace('.', ','))
            f.write(f'& {distance_stds[isControlGroup, 0]:.2f} '.replace('.', ','))

            if isControlGroup:
                f.write('\\\\\\cline{1-13}\n')
            else:
                f.write('\\\\\\hline\n')

        f.write('\t\\end{tabular}\n')
        f.write('\\end{table}\n')

print(distance_means)
print(distance_stds)
print_table()
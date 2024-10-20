import pandas as pd, json

phonemes = [ 'i', 'ɪ', 'ɛ', 'æ', 'ʌ', 'ɑ', 'ɔ', 'ʊ', 'u', 'ɚ' ]
columns = ['sex', 'speaker', 'phoneme_id', 'phoneme_ascii', 'F1', 'F2']

pb_data = pd.read_csv('verified_pb.data', sep='\t', header=None, names=columns,
                      usecols=[0, 1, 2, 3, 5, 6])
pb_data['identified'] = pb_data['phoneme_ascii'].apply(lambda x: x[0] != '*')
pb_data.drop('phoneme_ascii', axis=1, inplace=True)
for speaker in pb_data['speaker'].unique():
    rows = pb_data['speaker'] == speaker
    speaker_data = pb_data[rows]
    # calculate mean F1 for each speaker
    for formant in ['F1', 'F2']:
        mean = speaker_data[formant].mean()
        standard_deviation = speaker_data[formant].std()
        pb_data.loc[rows, formant + '_lobanov'] = (speaker_data[formant] - mean) / standard_deviation

# export Lobanov-scaled formants to a JSON file like this:
# {
#     "i" : [
#             {
#                "F1" : 0.5,
#                "F2" : 0.5,
#                "identified" : true
#            },
#            ...
#     ],
#     "ɪ" : [
#         ...
# }

lobanov_data = {}
for phoneme_id in range(1, 11):
    phoneme = phonemes[phoneme_id - 1]
    rows = pb_data['phoneme_id'] == phoneme_id
    phoneme_data = pb_data[rows]
    phoneme_data = phoneme_data[['F1_lobanov', 'F2_lobanov', 'identified']]
    phoneme_data = phoneme_data.rename(columns={'F1_lobanov': 'F1', 'F2_lobanov': 'F2'})
    print(phoneme_data)
    lobanov_data[phoneme] = phoneme_data.to_dict(orient='records')

with open('../js/const/vowels/peterson_barney.json', 'w', encoding="utf-8") as f:
    json.dump(lobanov_data, f, ensure_ascii=False)
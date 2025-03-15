import json, numpy as np, sys, os, pandas as pd

responses = pd.read_csv('./data/results_input/responses.txt', encoding='utf_16_le', sep='\t')
responses = responses.drop(columns=['email_address', 'remarks', 'native'])
responses_columns = responses.columns.tolist()
speaker_columns = ['microphoneLabel', 'preset', 'isControlGroup', 'timeSpent', 'version', 'speechMin', 'speechMax', 'speechMean', 'silenceMin', 'silenceMax', 'silenceMean', 'speaker_F1_mean', 'speaker_F2_mean', 'speaker_F1_SD', 'speaker_F2_SD']
vowel_columns = ['vowel', 'isPre', 'distance_to_target', 'distance_to_closest', 'closest_phoneme']

speaker_data = pd.DataFrame(columns = responses_columns + speaker_columns)
distances_data = pd.DataFrame(columns = ['no'] + vowel_columns)
distances_long_format = pd.DataFrame(columns = responses_columns + speaker_columns + vowel_columns)

# index responses by id ('no')
responses = responses.set_index('no')

np.set_printoptions(suppress=True)
np.seterr(all='raise')

def sym_inverse(matrix):
    return np.array([[matrix[1][1], -matrix[0][1]], [-matrix[1][0], matrix[0][0]]]) / np.linalg.det(matrix)

def is_int(value):
    try:
        return int(value) == value
    except ValueError:
        return False

peterson_barney = json.load(open('./data/peterson_barney.json', 'r', encoding='utf-8'))
del peterson_barney['ɚ']
pb_distributions = {}

def get_speaker_avg(vowel, speaker_id):
    avg = np.zeros(2)
    count = 0
    for measurement in [measurement for measurement in peterson_barney[vowel] if measurement['speaker'] == speaker_id]:
        avg[0] += measurement['F1']
        avg[1] += measurement['F2']
        count += 1
    avg /= count
    return avg

def get_vowel_avg(vowel):
    avg = np.zeros(2)
    count = 0
    for measurement in vowel['formants']:
        avg[0] += measurement['y']
        avg[1] += measurement['x']
        count += 1
    avg /= count
    return avg

def get_sex(speaker_id):
    if speaker_id <= 33:
        return "male"
    if speaker_id <= 61:
        return "female"
    return "child"

MD = [{}, {}, {}]

for phoneme in peterson_barney.keys():
    # empty 2d vector
    avg = np.zeros(2)
    variance = np.zeros(2)
    covariance = 0
    count = 0
    for measurement in peterson_barney[phoneme]:
        avg[0] += measurement['F1']
        avg[1] += measurement['F2']
        count += 1
    avg /= count
    for measurement in peterson_barney[phoneme]:
        dx = measurement['F1'] - avg[0]
        dy = measurement['F2'] - avg[1]
        variance[0] += dx ** 2
        variance[1] += dy ** 2
        covariance += dx * dy
    variance /= count
    covariance /= count
    cov_matrix = np.array([[variance[0], covariance], [covariance, variance[1]]])
    pb_distributions[phoneme] = { 'avg': avg, 'cov_matrix': cov_matrix }
    for i in range(3):
        MD[i][phoneme] = np.zeros(2)

def calculate_distances(f, name='self', test=None):
    use_pb = name == 'self' or is_int(name)
    if test:
        use_pb = False

    vowels = []; speaker_json = None
    
    if use_pb:
        vowels = peterson_barney.keys()
    elif test:
        speaker_json = vowels = json.load(open(f'./data/results_input/{name}.json', 'r', encoding='utf-8'))
        isControlGroup = vowels.get("isControlGroup") == True
        time = vowels.get("timeSpentInTraining")
        version = vowels.get("version")
        if test == 'pre':
            vowels = vowels['foreignInitial']
        elif test == 'post':
            vowels = vowels['foreignRepeat']
        else:
            raise ValueError(f"Unknown test type: {test}")
        vowels = vowels["vowelsProcessed"]
    else:
        vowels = json.load(open(f'./data/{name}_vowels.json', 'r', encoding='utf-8'))

    # speaker_data
    try:
        response = responses.loc[int(name)]
    except ValueError:
        print(f"{name} could not be converted to an integer")
        return 0, False, 0, 0
    app_speaker_result = pd.Series({
        'no': int(name),
        'microphoneLabel': speaker_json.get('microphoneLabel'),
        'preset': speaker_json.get('preset').get('name'),
        'isControlGroup': isControlGroup,
        'timeSpent': time,
        'version': version,
        'speechMin': speaker_json.get('intensityStats').get('speechStats').get('min'),
        'speechMax': speaker_json.get('intensityStats').get('speechStats').get('max'),
        'speechMean': speaker_json.get('intensityStats').get('speechStats').get('mean'),
        'silenceMin': speaker_json.get('intensityStats').get('silenceStats').get('min'),
        'silenceMax': speaker_json.get('intensityStats').get('silenceStats').get('max'),
        'silenceMean': speaker_json.get('intensityStats').get('silenceStats').get('mean'),
        'speaker_F1_mean': speaker_json.get('nativeVowels').get('meanFormants').get('y'),
        'speaker_F2_mean': speaker_json.get('nativeVowels').get('meanFormants').get('x'),
        'speaker_F1_SD': speaker_json.get('nativeVowels').get('formantsDeviation').get('y'),
        'speaker_F2_SD': speaker_json.get('nativeVowels').get('formantsDeviation').get('x')
    })
    if (test == 'pre'):
        speaker_data.loc[len(speaker_data)] = pd.concat([response, app_speaker_result])

    display_name = name
    if test:
        display_name = f"{name}-{test} ({'control' if isControlGroup else 'experimental'})"
    elif is_int(name):
        display_name = f"Speaker {name:02d} ({get_sex(name)})"
    print(f'Distances for {display_name}:', file=f)
    
    n = len(vowels)
    phonemes = []
    dist_of_avg_matrix = np.zeros((n, n))
    avg_dist_matrix = np.zeros((n, n))
    min_matrix = np.zeros((n, n))
    max_matrix = np.zeros((n, n))

    speaker_avgs = {}

    for vowel_id, vowel in enumerate(vowels):
        if use_pb:
            speaker_phoneme = vowel
        else:
            speaker_phoneme = vowel['letter']
        phonemes.append(speaker_phoneme)

        speaker_avg = np.zeros(2)
        if name == 'self':
            speaker_avg = pb_distributions[vowel]['avg']
        elif is_int(name):
            speaker_avg = get_speaker_avg(speaker_phoneme, name)
        elif test:
            speaker_avg = get_vowel_avg(vowel)
        else:
            speaker_avg[0] = vowel['avg']['y']
            speaker_avg[1] = vowel['avg']['x']
        speaker_avgs[speaker_phoneme] = speaker_avg

        for target_id, target in enumerate(vowels):
            if use_pb:
                phoneme = target
            else:
                phoneme = target['letter']
            avg = pb_distributions[phoneme]['avg']
            cov_matrix = pb_distributions[phoneme]['cov_matrix']
            cov_inv = sym_inverse(cov_matrix)

            d = speaker_avg - avg
            dist_of_avg_matrix[vowel_id][target_id] = d @ cov_inv @ d # Mahalanobis distance squared of the average formants

            avg_log_mahalanobis2 = 0    # Mean of the logarithm of the Mahalanobis distance squared
            min_mahalanobis2 = float('inf')
            max_mahalanobis2 = 0
            count = 0
            measurements = []
            if name == 'self':
                measurements = peterson_barney[vowel]
            elif is_int(name):
                measurements = [measurement for measurement in peterson_barney[vowel] if measurement['speaker'] == name]
            else:
                measurements = vowel['formants']

            for measurement in measurements:
                if use_pb:
                    dx = measurement['F1'] - avg[0]
                    dy = measurement['F2'] - avg[1]
                else:    
                    dx = measurement['y'] - avg[0]
                    dy = measurement['x'] - avg[1]
                d = np.array([dx, dy])
                mahalanobis2 = d @ cov_inv @ d
                avg_log_mahalanobis2 += np.log(mahalanobis2)

                if mahalanobis2 < min_mahalanobis2:
                    min_mahalanobis2 = mahalanobis2
                if mahalanobis2 > max_mahalanobis2:
                    max_mahalanobis2 = mahalanobis2
                count += 1
            avg_log_mahalanobis2 /= count
            avg_mahalanobis2 = np.exp(avg_log_mahalanobis2)

            avg_dist_matrix[vowel_id][target_id] = avg_mahalanobis2
            min_matrix[vowel_id][target_id] = min_mahalanobis2
            max_matrix[vowel_id][target_id] = max_mahalanobis2

    avg_score = 0
    harmonic_score = 0
    total_penalty = 0

    for index, phoneme in enumerate(phonemes):
        distance_to_target = avg_dist_matrix[index][index]
        MD[0 if isControlGroup else 1 if time < 300_000 else 2][phoneme][0 if test == "pre" else 1] += np.sqrt(distance_to_target)
        distance_to_closest = float('inf')
        closest_phoneme = ''
        for i, dist in enumerate(avg_dist_matrix[index]):
            if i != index and dist < distance_to_closest:
                distance_to_closest = dist
                closest_phoneme = phonemes[i]

        try:
            app__vowel_result = pd.Series({
                'vowel': phoneme,
                'isPre': test == 'pre',
                'distance_to_target': distance_to_target,
                'distance_to_closest': distance_to_closest,
                'closest_phoneme': closest_phoneme
            })
            long_row = pd.concat([response, app_speaker_result, app__vowel_result])
            distances_long_format.loc[len(distances_long_format)] = long_row 
            short_row = pd.concat([pd.Series({'no': int(name)}), app__vowel_result])
            distances_data.loc[len(distances_data)] = short_row
            #print(output.head())
        except ValueError:
            pass
        
        score = (distance_to_closest - distance_to_target) / (distance_to_closest + distance_to_target) / 2 + 0.5
        
        if (round(100 * score) < 55):
            distance = np.sqrt(np.sum((speaker_avgs[phoneme] - speaker_avgs[closest_phoneme]) ** 2))
            if distance < 0.3:
                penalty = np.exp(-100 * distance ** 2) * 15
                print(f"Penalty incurred for merging {phoneme} and {closest_phoneme}: {penalty:.02f}", file=f)
                total_penalty += penalty
            else:
                print(f"Warning: {phoneme} and {closest_phoneme} confusion, distance = {distance:.02f}", file=f)

        avg_score += score
        harmonic_score += 1 / score

        print(phoneme, round(distance_to_target, 2), round(distance_to_closest, 2), closest_phoneme, round(100 * score), sep='\t', file=f)
    
    avg_score /= n
    harmonic_score = n / harmonic_score

    print(f"Score: {100 * avg_score:.01f}, Harmonic mean: {100 * harmonic_score:.01f}, Penalty: {-total_penalty:.01f}", file=f)
    print(file=f)

    return 100 * harmonic_score - total_penalty, isControlGroup, time, version

def write_results(f):
    calculate_distances(f)
    calculate_distances(f, 'Trump')
    min_score = calculate_distances(f, 'Hillary')
    min_speaker = 0
    for speaker_id in range(1, 77):
        score = calculate_distances(f, speaker_id)
        if score < min_score:
            print(f"Speaker {speaker_id} has the lowest score equal to {score:.01f}, compared to {min_score:.01f}")
            min_score = score
            min_speaker = speaker_id
    print(f"Speaker {min_speaker} has the lowest score")

# filename = sys.argv[1] if len(sys.argv) > 1 else None

# if filename:
#     with open(filename, 'w', encoding='utf-8') as f:
#         write_results(f)
# else:
#     write_results(sys.stdout)

avgs = np.zeros([2, 3])
count = np.zeros(3)

for file in os.listdir('./data/results_input'):
    if file.endswith('.json'):
        number = file[:-5]
        with open(f'./data/results_output/{number}.txt', 'w', encoding='utf-8') as f:
            pre_score, isControl, timeSpent, version = calculate_distances(f, number, "pre")
            post_score, _, _, _ = calculate_distances(f, number, "post")
            i = 0 if isControl else 2
            if not isControl and timeSpent < 300_000:
                # print(f"Warning: {number} spent less than 5 minutes in training")
                i = 1
            avgs[0][i] += pre_score
            avgs[1][i] += post_score
            count[i] += 1
            
# print(avgs)
# print(count)
# avgs /= count
# print(avgs)

def print_MD(i):
    for phoneme in MD[i]:
        print(phoneme, sep='\t', end='\t')
    print()
    for phoneme in MD[i]:
        print(round(MD[i][phoneme][0] / count[i], 1), sep='\t', end='\t')
    print()
    for phoneme in MD[i]:
        print(round(MD[i][phoneme][1] / count[i], 1), sep='\t', end='\t')
    print()

print("Control group:")
print_MD(0)
print()
print("Experimental group (less than 5 minutes):")
print_MD(1)
print()
print("Experimental group (5 minutes or more):")
print_MD(2)

distances_long_format.to_csv('./data/results_output/distances_long_format.csv', index=False, encoding='utf-8')
distances_data.to_csv('./data/results_output/distances.csv', index=False, encoding='utf-8')
speaker_data.to_csv('./data/results_output/speakers.csv', index=False, encoding='utf-8')
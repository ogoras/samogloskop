import json, numpy as np
np.set_printoptions(suppress=True)
np.seterr(all='raise')

def sym_inverse(matrix):
    return np.array([[matrix[1][1], -matrix[0][1]], [-matrix[1][0], matrix[0][0]]]) / np.linalg.det(matrix)

peterson_barney = json.load(open('../data/peterson_barney.json', 'r', encoding='utf-8'))
pb_distributions = {}

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

def calculate_distances(name='self'):
    print(f'Calculating distances for {name}:')
    n = 0; vowels = []
    if name == 'self':
        vowels = peterson_barney.keys()
        n = len(vowels)
    else:
        vowels = json.load(open(f'../data/{name}_vowels.json', 'r', encoding='utf-8'))
        n = len(vowels)
    
    phonemes = []
    dist_of_avg_matrix = np.zeros((n, n))
    avg_dist_matrix = np.zeros((n, n))
    min_matrix = np.zeros((n, n))
    max_matrix = np.zeros((n, n))

    for vowel_id, vowel in enumerate(vowels):
        if name == 'self':
            phonemes.append(vowel)
        else:
            phonemes.append(vowel['letter'])

        for target_id, target in enumerate(vowels):
            if name == 'self':
                phoneme = target
            else:
                phoneme = target['letter']
            avg = pb_distributions[phoneme]['avg']
            cov_matrix = pb_distributions[phoneme]['cov_matrix']
            cov_inv = sym_inverse(cov_matrix)

            if name == 'self':
                dx = 0
                dy = 0
            else:
                dx = vowel['avg']['y'] - avg[0]
                dy = vowel['avg']['x'] - avg[1]
            d = np.array([dx, dy])
            dist_of_avg_matrix[vowel_id][target_id] = d @ cov_inv @ d # Mahalanobis distance squared of the average formants

            avg_log_mahalanobis2 = 0    # Mean of the logarithm of the Mahalanobis distance squared
            min_mahalanobis2 = float('inf')
            max_mahalanobis2 = 0
            count = 0
            for measurement in vowel['formants'] if name != 'self' else peterson_barney[vowel]:
                if name == 'self':
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

    avg_scores = np.zeros(4)
    geom_avg_scores = np.ones(4)
    harmonic_avg_scores = np.zeros(4)

    for index, phoneme in enumerate(phonemes):
        distance_to_target = avg_dist_matrix[index][index]
        distance_to_closest = float('inf')
        closest_phoneme = ''
        for i, dist in enumerate(avg_dist_matrix[index]):
            if i != index and dist < distance_to_closest:
                distance_to_closest = dist
                closest_phoneme = phonemes[i]
        
        scores = np.array([distance_to_closest / distance_to_target,
                            np.exp(distance_to_closest - distance_to_target),
                            (distance_to_closest - distance_to_target) / (distance_to_closest + distance_to_target) / 2 + 0.5,
                            distance_to_closest + 50 * distance_to_closest / distance_to_target])
        
        avg_scores += scores
        geom_avg_scores *= scores
        harmonic_avg_scores += 1 / scores

        scores[1] = np.log(scores[1])

        print(phoneme, round(distance_to_target, 2), round(distance_to_closest, 2), closest_phoneme, 
            scores.round(2),
            sep='\t')
    
    avg_scores /= n
    geom_avg_scores **= 1 / n
    harmonic_avg_scores = n / harmonic_avg_scores

    avg_scores[1] = np.log(avg_scores[1])
    geom_avg_scores[1] = np.log(geom_avg_scores[1])
    harmonic_avg_scores[1] = np.log(harmonic_avg_scores[1])

    print('Average scores:', avg_scores.round(2))
    print('Geometric average scores:', geom_avg_scores.round(2))
    print('Harmonic average scores:', harmonic_avg_scores.round(2))

calculate_distances()
calculate_distances('Trump')
calculate_distances('Hillary')
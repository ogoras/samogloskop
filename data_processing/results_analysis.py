import json, numpy as np

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

for phoneme in peterson_barney.keys():
    avg = pb_distributions[phoneme]['avg']
    cov_matrix = pb_distributions[phoneme]['cov_matrix']
    cov_inv = sym_inverse(cov_matrix)

    avg_d2 = np.zeros(2)    # Formant deltas squared
    avg_mahalanobis2 = 0    # Mahalanobis distance squared
    count = 0
    for measurement in peterson_barney[phoneme]:
        dx = measurement['F1'] - avg[0]
        dy = measurement['F2'] - avg[1]
        d = np.array([dx, dy])
        avg_d2[0] += dx ** 2
        avg_d2[1] += dy ** 2
        mahalanobis2 = d @ cov_inv @ d
        avg_mahalanobis2 += mahalanobis2
        count += 1
    avg_d2 /= count
    avg_mahalanobis2 /= count
    
    print(phoneme, np.diag(cov_matrix), avg_d2, avg_mahalanobis2)
    
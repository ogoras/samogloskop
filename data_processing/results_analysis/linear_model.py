import pandas as pd, numpy as np
import statsmodels.formula.api as smf

print("Libraries imported")

FOLDER_ENDING = '' # '_phases1&2'

# load data
distances_data = pd.read_csv(f'data/results_output{FOLDER_ENDING}/distances_long_format.csv')

# # append data from other phases
# distances_data2 = pd.read_csv(f'data/results_output_phases1&2/distances_long_format.csv')
# distances_data = pd.concat([distances_data, distances_data2], ignore_index=True)
# distances_data = distances_data[distances_data['isPre']]

print("Data loaded")
distances_data['distance_to_target'] = np.log10(distances_data['distance_to_target']) / 2   # log-transform to make it homoscedastic
# distances_data['distance_to_target'] = np.sqrt(np.sqrt(distances_data['distance_to_target'])) # sqrt-transform to make it homoscedastic?
distances_data['Q'] = 10 * (np.log10(distances_data['speechMean']) - np.log10(distances_data['silenceMax']))

def fit_data(show_residuals=False, data=distances_data, formula="distance_to_target ~ isControlGroup * isPre"):
    # model = bmb.Model("distance_to_target ~ isControlGroup * isPre + (1|C(no)) + (1|vowel)", distances_data)
    model = smf.mixedlm(formula, data, groups=data["no"])
    print("Model created")
    # model.fit()
    result = model.fit()
    print("Model fit")
    # model.summary()
    print(result.summary())

    if show_residuals:
        # compute residuals
        residuals = result.resid
        print("Residuals computed")
        # compute fitted values
        fitted_values = result.fittedvalues
        print("Fitted values computed")
        # plot residuals vs fitted values
        import matplotlib.pyplot as plt
        plt.scatter(fitted_values, residuals)
        plt.xlabel("Fitted values")
        plt.ylabel("Residuals")
        plt.title("Residuals vs Fitted values")
        plt.axhline(0, color='red', linestyle='--')
        plt.show()

    # calculate eta-squared value
    predicted_variance = np.var(result.fittedvalues)
    total_variance = np.var(distances_data['distance_to_target'])
    eta_squared = predicted_variance / total_variance
    print("Eta-squared:")
    print(eta_squared)

    return result

vowels = 'iɪɛæɑʌɔʊu'

result = fit_data(True)

# # get vector of random effects
# random_effects = result.random_effects
# print("Random effects:")
# print(random_effects)

# # get vector of error terms epsilon
# error_terms = result.resid
# print("Error terms:")
# print(error_terms)
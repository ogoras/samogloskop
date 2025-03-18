import pandas as pd, bambi as bmb, arviz as az, numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf

# load data
distances_data = pd.read_csv('data/results_output/distances_long_format.csv')
print("Data loaded")
distances_data['distance_to_target'] = np.sqrt(np.sqrt(distances_data['distance_to_target']))   # transform to square root of MD instead of MD squared

# model = bmb.Model("distance_to_target ~ isControlGroup * isPre + (1|C(no)) + (1|vowel)", distances_data)
model = smf.mixedlm("distance_to_target ~ isControlGroup * isPre", distances_data, groups=distances_data["no"])
print("Model created")
# model.fit()
result = model.fit()
print("Model fit")
# model.summary()
print(result.summary())

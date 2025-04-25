import pandas as pd, bambi as bmb, arviz as az, numpy as np
import statsmodels.api as sm
import statsmodels.formula.api as smf

# load data
distances_data = pd.read_csv('data/results_output/distances_long_format.csv')
print("Data loaded")
distances_data['distance_to_target'] = np.log(distances_data['distance_to_target'])   # log-transform to make it homoscedastic

# model = bmb.Model("distance_to_target ~ isControlGroup * isPre + (1|C(no)) + (1|vowel)", distances_data)
model = smf.mixedlm("distance_to_target ~ isControlGroup * isPre", distances_data, groups=distances_data["no"])
print("Model created")
# model.fit()
result = model.fit()
print("Model fit")
# model.summary()
print(result.summary())

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

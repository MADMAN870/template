import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score
import pandas as pd

# Générer un jeu de données simple
X, y = make_moons(n_samples=300, noise=0.2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Définir les configurations de couches et fonctions d'activation à tester
configurations = [
    {'hidden_layer_sizes': (3,), 'activation': 'relu'},
    {'hidden_layer_sizes': (3,), 'activation': 'tanh'},
    {'hidden_layer_sizes': (3,), 'activation': 'logistic'},
    {'hidden_layer_sizes': (3, 5), 'activation': 'relu'},
    {'hidden_layer_sizes': (3, 5), 'activation': 'tanh'},
    {'hidden_layer_sizes': (3, 5), 'activation': 'logistic'},
    {'hidden_layer_sizes': (3, 10), 'activation': 'relu'},
    {'hidden_layer_sizes': (3, 10), 'activation': 'tanh'},
    {'hidden_layer_sizes': (3, 10), 'activation': 'logistic'}
]

results = []

# Tester chaque configuration et enregistrer l'accuracy
for config in configurations:
    mlp = MLPClassifier(**config, max_iter=1000)
    mlp.fit(X_train, y_train)
    y_pred = mlp.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    results.append({'hidden_layers': config['hidden_layer_sizes'], 'activation': config['activation'], 'accuracy': accuracy})

# Tracer la frontière de décision pour chaque configuration testée
xx, yy = np.meshgrid(np.arange(X[:, 0].min() - 1, X[:, 0].max() + 1, 0.01),
                     np.arange(X[:, 1].min() - 1, X[:, 1].max() + 1, 0.01))

# Afficher les résultats dans un tableau de comparaison
df_results = pd.DataFrame(results)
print(df_results)

# Tracer la courbe de descente de gradient pour la dernière configuration testée
plt.plot(mlp.loss_curve_)
plt.title('Courbe de descente de gradient')
plt.xlabel('Iterations')
plt.ylabel('Loss')
plt.show()

"""Calcul des pente en chaque point d'une courbe
les arguments sont un tableau d'objets [{'x':...,'y':...},{}])
La fonction retourne aussi un tableau d'objets [{'x':..., pente:...},{}]
"""

import numpy as np
import sys
import json

args = sys.stdin.readlines()   # lecture des arguments
arg = json.loads(args[0])      # désérialization

# mise en forme des données
x = np.array([])
y = np.array([])
for e in arg:
  x = np.append(x,e['x'])
  y = np.append(y,e['y'])

# calcul de la fonction polynomiale
p = np.polyfit(x,y,3)

# fonction dérivée
def derive(x, p):
  return 3*p[0]*x*x + 2*p[1]*x + p[2]

# mise en forme du tableau résultat
res = []
for e in x:
  y = derive(e,p)
  res.append({'x':e,'y':y})

print(json.dumps(res))

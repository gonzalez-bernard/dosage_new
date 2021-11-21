'''
Utilise la méthode getEquations de la classe Equation pour lire le fichier equations.csv
On récupère les équations et on les transmet au javascript
'''
import sys
import json
#import settings


from Equation import Equations
e = Equations()

r = e.get_equations()
result = []
for elt in r:
    result.append(json.dumps(elt.__dict__))

print(json.dumps(result))
sys.stdout.flush()
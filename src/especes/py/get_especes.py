'''
Utilise la méthode getEspeces de la classe Especes pour lire le fichier couples_acide_base.csv
On récupère les especes et on les transmet au javascript
'''
import sys
import json
import os

sys.path.append(os.getcwd())

from src.especes.py.Especes import Especes
from src.especes.py.Equation import Equations

e = Especes()
acidebases, autredos = e.get_especes()

def _set_equation(elt, reaction):
  t = reaction['reactifs']+"/"+ reaction['produits']
  t += "/"+ reaction['spectateurs']
  r = t.split('/')
  x = Equations.get_equation(r,"'")
  x.colors.append(elt['ctitre'])
  x.colors.append(elt['ctitrant'])
  x.colors.append(elt['cfinale'])
  if 'ccourant' in elt:
    x.colors.append(elt['ccourant'])
  x.pH = float(elt['pH'])

  if 'potentiels' in elt:
    for pot in elt['potentiels']:
      x.potentiels.append(json.loads(elt['potentiels'][pot]))
      
  return x

eqs = []
for elt in autredos:
  if elt['n_reaction'] == '1':
    x = _set_equation(elt, elt['reaction'])
    eqs.append(x)
  else:
    es = []
    for i in range(2):
      x = _set_equation(elt, elt['reaction'][i])
      es.append(x)
    eqs.append(es)
    
result = []
for elt in eqs:
  if isinstance(elt,list):
    x = []
    for et in elt:
      x.append(json.dumps(et.__dict__))
    result.append(x)
  else:
    result.append(json.dumps(elt.__dict__))

b = e.get_lst_select(0)
c = e.get_lst_select(1)

data={'acidebases':acidebases,'list_acidebase':b, 'autredos':autredos, 'list_autredos':c, 'eqs': result}
print(json.dumps(data))

sys.stdout.flush()
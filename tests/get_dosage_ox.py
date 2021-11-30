import csv
import re
import sys
import os
import json

sys.path.append(os.getcwd())
from numpy import round as rd
from src.dosage.py.Dosage import Dosage
from src.dosage.py.Dosage_ox import Dosage_ox
from src.dosage.py.C import C

datas = []

# id = 0
datas.append({
  'c1':0.01,
  'c2':0.01,
  'c3': 0,
  'c4': 0.17,
  'v1': 10,
  'v3': 0,
  'v4': 1,
  've': 40,
  'v_max':25,
  'ph': -0.7,
  'eq': "[{\"reactifs\":[[\"Fe²⁺\",2,{\"Fe\":1}],[\"MnO₄⁻\",-1,{\"Mn\":1,\"O\":4}],[\"H₃O⁺\",1,{\"H\":3,\"O\":1}]],\"produits\":[[\"Fe³⁺\",3,{\"Fe\":1}],[\"Mn²⁺\",2,{\"Mn\":1}],[\"H₂O\",0,{\"H\":2,\"O\":1}]],\"nom_reactifs\":\"\",\"nom_produits\":\"\",\"equation_non_equilibree\":\"Fe²⁺ + MnO₄⁻ + H₃O⁺ → Fe³⁺ + Mn²⁺ + H₂O\",\"equationEquilibre\":\"5 Fe²⁺ + 1 MnO₄⁻ + 8 H₃O⁺ → 5 Fe³⁺ + 1 Mn²⁺ + 12 H₂O\",\"coeffs\":[5,1,8,5,1,12],\"massesmolaires\":[55.8,118.9,19,55.8,54.9,18],\"colors\":[\"vert_pale\",\"violet\",\"violet\"],\"pH\":5,\"potentiels\":[[0.77,1],[1.51,5]],\"spectateurs\":[[\"Cl⁻\",-1,{\"Cl\":1}],[\"K⁺\",1,{\"K\":1}],[\"Cl⁻\",-1,{\"Cl\":1}]]}]",
  'type':1
})

# id = 4
datas.append({
  'c1':0.05,
  'c2':0.05,
  'v1': 10,
  'v_max':40,
  've': 40,
  'ph': 7,
  'eq': "[{\"reactifs\":[[\"Ba²⁺\",2,{\"Ba\":1}],[\"SO₄²⁻\",-2,{\"S\":1,\"O\":4}]],\"produits\":[[\"BaSO₄\",0,{\"Ba\":1,\"S\":1,\"O\":4}]],\"nom_reactifs\":null,\"nom_produits\":null,\"equation_non_equilibree\":\"Ba²⁺ + SO₄²⁻ → BaSO₄\",\"equationEquilibre\":\"1 Ba²⁺ + 1 SO₄²⁻ → 1 BaSO₄\",\"coeffs\":[1,1,1],\"massesmolaires\":[137.3,96,233.3],\"colors\":[\"incolore\",\"incolore\",\"blanc\",\"blanc\"],\"pH\":7,\"potentiels\":[],\"spectateurs\":[[\"Na⁺\",1,{\"Na\":1}],[\"Cl⁻\",-1,{\"Cl\":1}]]}]",
  
  'type':1
})

# id = 5 retour
datas.append({
  'c1':0.1,
  'c2':0.1,
  'v1': 10,
  'v_max':40,
  'ph': 0,
  'c3':1,
  'v3':4,
  'c4': 1,
  'v4': 3,
  've': 40,
  'eq': '[{"reactifs":[["NO₃⁻",-1,{"N":1,"O":3}],["Fe²⁺",2,{"Fe":1}],["H₃O⁺",1,{"H":3,"O":1}]],"produits":[["NO",0,{"N":1,"O":1}],["Fe³⁺",3,{"Fe":1}],["H₂O",0,{"H":2,"O":1}]],"nom_reactifs":null,"nom_produits":null,"equation_non_equilibree":"NO₃⁻ + Fe²⁺ + H₃O⁺ → NO + Fe³⁺ + H₂O","equationEquilibre":"1 NO₃⁻ + 3 Fe²⁺ + 4 H₃O⁺ → 1 NO + 3 Fe³⁺ + 6 H₂O","coeffs":[1,3,4,1,3,6],"massesmolaires":[62,55.8,19,30,55.8,18],"colors":["incolore","violet","violet","vert_pale"],"pH":0.5,"potentiels":[[0.96,3],[1,51,5],[0.77,1]],"spectateurs":[["Ba²⁺",2,{"Ba":1}],["Cl⁻",-1,{"Cl":1}],["Cl⁻",-1,{"Cl":1}]]},{"reactifs":[["Fe²⁺",2,{"Fe":1}],["MnO₄⁻",-1,{"Mn":1,"O":4}],["H₃O⁺",1,{"H":3,"O":1}]],"produits":[["Fe³⁺",3,{"Fe":1}],["Mn²⁺",2,{"Mn":1}],["H₂O",0,{"H":2,"O":1}]],"nom_reactifs":null,"nom_produits":null,"equation_non_equilibree":"Fe²⁺ + MnO₄⁻ + H₃O⁺ → Fe³⁺ + Mn²⁺ + H₂O","equationEquilibre":"5 Fe²⁺ + 1 MnO₄⁻ + 8 H₃O⁺ → 5 Fe³⁺ + 1 Mn²⁺ + 12 H₂O","coeffs":[5,1,8,5,1,12],"massesmolaires":[55.8,118.9,19,55.8,54.9,18],"colors":["incolore","violet","violet","vert_pale"],"pH":0.5,"potentiels":[[0.96,3],[1,51,5],[0.77,1]],"spectateurs":[["Cl⁻",-1,{"Cl":1}],["K⁺",1,{"K":1}],["Cl⁻",-1,{"Cl":1}]]}]',
  
  'type':2
})

# id = 6
datas.append({
  'c1':0.01,
  'c2':0.02,
  'v1': 10,
  'v_max':40,
  've': 40,
  'ph': 10,
  'eq': '[{"reactifs":[["CaNt⁻",-1,{"Ca":1,"Nt":1}],["Y⁴⁻",-4,{"Y":1}],["H₂O",0,{"H":2,"O":1}]],"produits":[["CaY²⁻",-2,{"Ca":1,"Y":1}],["HNt²⁻",-2,{"H":1,"Nt":1}],["HO⁻",-1,{"H":1,"O":1}]],"nom_reactifs":null,"nom_produits":null,"equation_non_equilibree":"CaNt⁻ + Y⁴⁻ + H₂O → CaY²⁻ + HNt²⁻ + HO⁻","equationEquilibre":"1 CaNt⁻ + 1 Y⁴⁻ + 1 H₂O → 1 CaY²⁻ + 1 HNt²⁻ + 1 HO⁻","coeffs":[1,1,1,1,1,1],"massesmolaires":[501,292,18,332,462,17],"colors":["rouge","incolore","bleu"],"pH":10,"potentiels":[],"spectateurs":[["Cl⁻",-1,{"Cl":1}],["Na⁺",1,{"Na":1}],["",0,{"":0}]]}]',
  'type':1
})

# id = 7 excés
datas.append({
  'c1':0.01,
  'c2':0.01,
  'v1': 10,
  'v_max':40,
  'ph': 4,
  'c3':1,
  'c4':0,
  'v3':1,
  've':40,
  'v4': 0,
  'eq': '[{"reactifs":[["Cu²⁺",2,{"Cu":1}],["I⁻",-1,{"I":1}]],"produits":[["CuI",0,{"Cu":1,"I":1}],["I₂",0,{"I":2}]],"nom_reactifs":null,"nom_produits":null,"equation_non_equilibree":"Cu²⁺ + I⁻ → CuI + I₂","equationEquilibre":"2 Cu²⁺ + 4 I⁻ → 2 CuI + 1 I₂","coeffs":[2,4,2,1],"massesmolaires":[63.5,126.9,190.4,253.8],"colors":["brun","jaune","jaune_pale"],"pH":4,"potentiels":[[0.16,1],[0.09,2],[0.62,2]],"spectateurs":[["SO₄²⁻",-2,{"S":1,"O":4}],["K⁺",1,{"K":1}]]},{"reactifs":[["I₂",0,{"I":2}],["S₂O₃²⁻",-2,{"S":2,"O":3}]],"produits":[["I⁻",-1,{"I":1}],["S₄O₆²⁻",-2,{"S":4,"O":6}]],"nom_reactifs":null,"nom_produits":null,"equation_non_equilibree":"I₂ + S₂O₃²⁻ → I⁻ + S₄O₆²⁻","equationEquilibre":"1 I₂ + 2 S₂O₃²⁻ → 2 I⁻ + 1 S₄O₆²⁻","coeffs":[1,2,2,1],"massesmolaires":[253.8,112,126.9,224],"colors":["brun","jaune","jaune_pale"],"pH":4,"potentiels":[[0.16,1],[0.09,2],[0.62,2]],"spectateurs":[["SO₄²⁻",-2,{"S":1,"O":4}],["K⁺",1,{"K":1}]]}]',
  'type':3
})


data = datas[0]


if data['type'] == C.TYPE_SIMPLE:
  eq = json.loads(data['eq'])[0]
else:
  eq = json.loads(data['eq'])


dos =  Dosage_ox(data['type'],data['c1'], data['c2'], data['v1'] , data['ve'])
dos.set_vmax(data['v_max'])   # volume max de titrant versé
# eq = data['eq']

if 'c3' in data and 'v3' in data:
  dos.set_reactif(data['c3'], data['v3'])
  dos.vol_init += data['v3']  # volume initial total

if 'c4' in data and 'v4' in data:
  dos.set_exc(data['c4'], data['v4'], data['ph'])
  dos.vol_init += data['v4']  # volume initial total
else:
  dos.set_exc(0, 0, data['ph'])


if data['type'] == C.TYPE_SIMPLE:
  dos.set_spectateurs(eq['spectateurs'])
  dos.set_reactifs(eq['reactifs'])
  dos.set_produits(eq['produits'])
  dos.set_coeffs(eq['coeffs'])
  if 'potentiels' in eq:
    dos.set_potentiels(eq['potentiels'])
  else:
    dos.set_potentiels([])
else:
  s = [eq[0]['spectateurs'],eq[1]['spectateurs']]
  dos.set_spectateurs(s)
  s = [eq[0]['reactifs'],eq[1]['reactifs']]
  dos.set_reactifs(s)
  s = [eq[0]['produits'],eq[1]['produits']]
  dos.set_produits(s)
  s = [eq[0]['coeffs'],eq[1]['coeffs']]
  dos.set_coeffs(s)

# calcul des couples v, σ
try:
  (v, s, c, p) = dos.main(0.1)
except Exception as e:
  data = {"Exception": e}
  print(json.dumps(data))

if v == 0:
  print(json.dumps({"ERREUR": 1}))

data = {
  'vols': rd(v,decimals = 3).tolist(), 
  'conds': rd(s, decimals = 4).tolist(),
  'concs': rd(c, decimals = 4).tolist(),
  'pots': rd(p, decimals = 4).tolist(),
}

print(json.dumps(data))
pass





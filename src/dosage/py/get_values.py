"""Récupère les couples v, pH et dpH/dv des courbes de dosage
  args doit contenir :
  - type : 0 = dosage acide ou 1 : dosage base
  - c1 et v1 : concentration et volume du titré
  - c2 : concentration du titrant
  - v_max : volume maximal de solution
  _ pK : tableau des pka, vide par défaut

  Returns:
      Array : [v, pH, dpH/dv]
"""
import sys
import os
sys.path.append(os.getcwd())


import json
from src.dosage.py.Dosage_ox import Dosage_ox
from src.dosage.py.Dosage_ph import Dosage_pH
from src.dosage.py.C import C
from src.problem.problem import Problem

from src.modules.utils import get_derive
from numpy import round as rd


ERR_DOSAGE_IMPOSSIBLE = 1

ERR_GETPROBLEM = 2

args = sys.stdin.readlines()
arg = json.loads(args[0])

func = arg['func'] if 'func' in arg else None
data = arg['datas']
#console.log(json.dumps(data))

if func == "data_dosage_ac":
  dos =  Dosage_pH(data['type'], data['c1'], data['c2'], data['v1'], data['ve'], data['pK'])
  
  dos.set_especes([data['esp1'],data['esp2']])
  dos.set_vmax(data['v_max'])

  # calcul des couples v, pH
  (v, pH, c, s) = dos.main(25, 0.1)
  
  # calcul des couples v, dpH 
  [v, dpH] = get_derive(v, pH)

  data = {
    'vols': list(rd(v,decimals = 3)), 
    'pHs': list(rd(pH,decimals = 3)),
    'dpHs': list(rd(dpH,decimals = 3)),
    'conds': list(rd(s, decimals = 4)),
    #'concs': list(rd(c, decimals = 4))
    }

  print(json.dumps(data))
  sys.stdout.flush()

elif func == "calc_derivee":
  [v, dpH] = get_derive(data['v'], data['pH'])
  data = {'vols': list(rd(v,decimals = 2)), 'dpHs': list(rd(dpH,decimals = 2))}
  print(json.dumps(data))
  sys.stdout.flush()

elif func == 'data_dosage_ox':
  if data['type'] == C.TYPE_SIMPLE:
    eq = json.loads(data['eq'])[0]
  else:
    eq = json.loads(data['eq'])
  
  dos =  Dosage_ox(data['type'], data['c1'], data['c2'], data['v1'] , data['ve'])

  # exc ou pH
  if 'c4' in data and 'v4' in data:
    dos.set_exc(data['c4'], data['v4'], data['pH'])
    dos.vol_init += data['v4']  # volume initial total
  else:
    dos.set_exc(0, 0, data['pH'])
  
  if 'c3' in data and 'v3' in data:
    dos.set_reactif(data['c3'], data['v3'])
    dos.vol_init += data['v3']  # volume initial total

  dos.set_vmax(data['v_max'])

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

  # calcul des couples v, σ et concentrations titré
  try:
    (v, s, c, p) = dos.main(0.1)
    if v == 0:
      print(ERR_DOSAGE_IMPOSSIBLE)
        
    data = {
    'vols': rd(v,decimals = 3).tolist(), 
    'conds': rd(s, decimals = 5).tolist(),
    'concs': rd(c, decimals = 5).tolist(),
    'pots': rd(p, decimals = 5).tolist(),
    }
    print(json.dumps(data))
  
  except Exception as e:
    print(ERR_DOSAGE_IMPOSSIBLE)
  
  sys.stdout.flush()

elif func == "get_problems":
  pb = Problem()
  try:
    data =  pb.getProblem(data['indice'])
    print(json.dumps(data))
    
  except:
    print(ERR_GETPROBLEM)

  sys.stdout.flush()

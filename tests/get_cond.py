import csv
import re
import sys
import os

sys.path.append(os.getcwd())

from src.dosage.Dosage import Dosage
from src.modules.utils import get_ListTuple_forValue, get_ListDict_forPropValue


data = {
  'esp1': {
    'acide': "H_2_SO_4_",
    'base': "SO_4_'2-'",
    'ampho': "HSO_4_'-'" 
  },
  'esp2':{
    'acide':"H_2_0",
    'base':"HO'-'",
    'ion':"Na'+'"
  },
  'V': [0,0.5,1,1.5,2,3,4,5,6,7,8,9,10,11,12],
  'pH': [1,1.04,1.09,1.13,1.18,1.27,1.37, 1.48, 1.6, 1.75, 1.95, 2.28, 7, 11.7, 12.0],
  'type': 1,
  'c1':0.1,
  'c2':0.1,
  'v1': 10,
  'pK':[4,9]
}

def _getCharge(formule):
  """Retourne la formule et la charge à partir de la formule

  Args:
  formule str :

  Returns:
  (formule, charge)
  """

  # On cherche la présence de l'apostrophe
  if "'" not in formule:
    return (formule, 0)
  
  reg = re.compile('(\d?[+-])')
  charge = reg.findall(formule)
  if charge[0] == '+':
    charge = 1
  elif charge[0] == '-':
    charge = -1
  else: 
    if charge[0][1] == '-':
      charge = -int(charge[0][0])
    else:
      charge = int(charge[0][0])

  return (formule, charge)
  
def _get_charges(data):
  """Enregistre les ions

  On les extrait de data['esp1'] et data['esp2] avec les id = acide, base, ou ampho.
  Il faut aussi trier entre les espèces moléculaires et les ions.
  Enfin, il faut tenir compte de la présence de H30+ et HO-

  Args:
      data (dict): liste des espèces

  Returns:
      [list(tuple)]: liste des formules et charges [(formule,charge),...]
  """
  
  ions = []
  for e in ['esp1','esp2']:
    if 'ion' in data[e]:
      (formule, charge) = get_charge(data[e]['ion'])
      if charge:
        ions.append((formule, charge))
    (formule,charge) = _getCharge(data[e]['acide'])
    if charge and ((formule,charge) not in ions):
      ions.append((formule, charge))
    (formule, charge) = _getCharge(data[e]['base'])
    if charge and ((formule,charge) not in ions):
      ions.append((formule, charge))
    if 'ampho' in data[e]:
      (formule, charge) = _getCharge(data[e]['ampho'])
      if charge:
        ions.append((formule, charge))
    

  if ("H_3_O'+'",1) not in ions:
    ions.append(("H_3_O'+'",1))

  if ("HO'-'",-1) not in ions:
    ions.append(("HO'-'",-1))
  
  return ions

def _set_concentrations(concentrations,data,spectateur,ions,type):
  if type == 0:

        # recherche de l'ion inconnu
    for e in ions:
      if e[0] not in ["H_3_O'+'","HO'-'",spectateur[0]]:
        inconnu = e
        break

    for i in range(len(data['V'])):
      h = pow(10,-data['pH'][i])
      w = 1e-14/h
      s = data['c2']*data['V'][i]/(data['V'][i]+10)
      x = -(h - w + spectateur[1]*s)/inconnu[1] 
      t = [{'f':"H_3_O'+'",'c':h}]
      t.append({'f':"HO'-'",'c':w})
      t.append({'f':spectateur[0],'c':s})
      t.append({'f':inconnu[0],'c':x})
      concentrations.append(t)
  else:

    # recherche de l'ion inconnu non ampho
    for e in ions:
      if e[0] not in ["H_3_O'+'","HO'-'",spectateur[0], data['esp1']['ampho'][0]]:
        inconnu = e
        break
    

    for i in range(len(data['V'])):
      h = pow(10,-data['pH'][i])
      w = 1e-14/h
      s = data['c2']*data['V'][i]/(data['V'][i]+data['v1'])
      a = h - w + s
      K = pow(10,-data["pK"][0])
      x1 = a/(1 + K/h)
      x2 = K*a/1 + K

      t = [{'f':"H_3_O'+'",'c':h}]
      t.append({'f':"HO'-'",'c':w})
      t.append({'f':spectateur[0],'c':s})
      t.append({'f': data['esp1']['ampho'], 'c':x1})
      t.append({'f':inconnu[0],'c':x2})
      concentrations.append(t)

def calc_conduc_ph(v, pH):

  concentrations = [] # tableau des dict concentrations pour chaque volume 

  # On récupère les conductivités
  with open('/datas/dosage/conductivites.csv', 'r') as cFile:
    cond = csv.DictReader(cFile, delimiter=',',)

    conductivites = []
    for elt in cond:
      c = float(elt['conductivite'])
      conductivites.append({'f':elt['formule'], 'cd': c})

  # récupère les charges
  ions = _get_charges(data)

  # recherche ions titrant spectateur
  ion_spectateur = (data['esp2']['ion'], ions[get_ListTuple_forValue(ions,data['esp2']['ion'])[0]][1])
    
  # Calcul des concentrations
  # si abscence de diacide
  if len(data['pK'])<2:
    _set_concentrations(concentrations, data,ion_spectateur,ions,0)
  else:
    _set_concentrations(concentrations, data, ion_spectateur, ions, 1)

  # Calcul de la conductivité
  conds = []
  i = 0
  for etat in concentrations:
    cd  = 0
    for ions in etat:
      idx = get_ListDict_forPropValue(conductivites, 'f', ions['f'])[0]
      cd = cd + conductivites[idx]['cd']*ions['c']
    conds.append((data['V'][i], cd))
    i = i +1

dos =  Dosage(data['type'], data['c1'], data['c2'], data['v1'], data['pK'])
calc_conduc_ph(data['V'], data['pH'])




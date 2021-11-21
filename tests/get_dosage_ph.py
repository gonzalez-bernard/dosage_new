import csv
import re
import sys
import os
import json

sys.path.append(os.getcwd())
from numpy import round as rd
from src.dosage.py.Dosage import Dosage
from src.dosage.py.C import C
from src.dosage.py.Dosage_ph import Dosage_pH
from src.modules.utils import get_derive

data1 = {
  'type' : 0,
  'c1': 0.01,
  'c2':0.01,
  'v1': 10,
  'v_max':25,
  've': 40,
  'pK': [2],
  'esp2': {'formule':"NaOH", 'nom':"hydroxyde de sodium", 'acide':"H_2_O", 'base':"OH'-'", 'conc':0.01, 'spec':"Na'+'", 'pka':"14"},
  
  'esp1': {'formule':"H_3_PO_4", 'nom':"acide phosphorique", 'acide':"H_3_PO_4", 'base':"HPO_4_'2-'",'ampho': "H_2_PO_4_'-'", 'conc':0.01, 'spec':"Na'+'", 'pka':"2.15, 7.2",'vol':10  }
}

data2 = {
  'type' : 0,
  'c1': 0.01,
  'c2':0.01,
  'v1': 10,
  'v_max':40,
  've': 0,
  'pK': [4.75],
  'esp2': {'formule':"NaOH", 'nom':"hydroxyde de sodium", 'acide':"H_2_O", 'base':"OH'-'", 'conc':0.1, 'spec':"Na'+'", 'pka':"14"},
  'esp1':{'formule':"CH_3_COOH", 'nom':"acide acétique", 'acide':"CH_3_COOH", 'base':"CH_3_COO'-'", 'conc':0.1, 'pka':"4.76"},
  
}


data3 = {
  'type' : 0,
  'c1': 0.01,
  'c2':0.01,
  'v1': 10,
  'v_max':40,
  'pK': [-4, 1.9],
  'esp1': {'formule':"H_2_SO_4_", 'nom':"acide sulfurique", 'acide':"H_3_O'+'", 'base':"SO_4_'2-'", 'conc':0.01, 'ampho':"HSO_4_'-'", 'pka':"-4,1.9", 'vol':10  },
  'esp2': {'formule':"NaOH", 'nom':"hydroxyde de sodium", 'acide':"H_2_O", 'base':"OH'-'", 'conc':0.01, 'spec':"Na'+'", 'pka':"14"},
  
}

data4 = {
  'type' : 0,
  'c1': 0.01,
  'c2':0.01,
  'v1': 10,
  'v_max':25,
  've': 40,
  'pK': [12.4],
  'esp2': {'formule':"NaOH", 'nom':"hydroxyde de sodium", 'acide':"H_2_O", 'base':"OH'-'", 'conc':0.01, 'spec':"Na'+'", 'pka':"14"},
  
  'esp1': {'formule':"HPO_4_'2-'", 'nom':"acide hydrogénophosphate", 'acide':"HPO_4_'2-'", 'base':"PO_4_'3-'", 'spec':"Na'+'", 'conc':0.01, 'pka':"12.4", 'vol':10  }
}

data5 = {
  'type' : 0,
  'c1': 0.03,
  'c2':0.01,
  'v1': 10,
  'v_max':25,
  've': 0,
  'pK': [-2.4],
  'esp2': {'formule':"NaOH", 'nom':"hydroxyde de sodium", 'acide':"H_2_O", 'base':"OH'-'", 'conc':0.01, 'spec':"Na'+'", 'pka':"14"},
  
  'esp1': {'formule':"H_3_O'+'", 'nom':"acide chlorhydrique", 'acide':"H_3_O'+'", 'base':"H_2_O", 'spec':"Cl'-'", 'conc':0.01, 'pka':"-2", 'vol':10  }
}

data6 = {
  'type' : 0,
  'c1': 0.1,
  'c2': 0.1,
  'v1': 10,
  'v_max': 25,
  've': 40,
  'pK': [9.2],
  'esp1': {'formule':"NH_4_OH", 'nom':"Ammoniac", 'acide':"NH_4_'+'", 'base':"NH_3_", 'conc':0.01,  'pka':"9.2", 'type':"5",'vol':10},
  
  'esp2': {'formule':"H_3_O'+'", 'nom':"acide chlorhydrique", 'acide':"H_3_O'+'", 'base':"H_2_O", 'spec':"Cl'-'", 'conc':0.01, 'pka':"-7", 'type':"0"}
}


data = data5
dos =  Dosage_pH(data['type'], data['c1'], data['c2'], data['v1'] , data['ve'], data['pK'])
dos.set_vmax(data['v_max'])

# calcul des couples v, σ
dos.set_especes([data['esp1'],data['esp2']])
"""
x = dos.get_type(0)
x = dos.get_type(1)
x = dos.get_typedosage()
"""

(v, pH, c, s) = dos.main(dos.v_max, 0.1)

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
pass





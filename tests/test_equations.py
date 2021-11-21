import sys
import json
import os

sys.path.append(os.getcwd())

from src.especes.Equation import Equations

reactifs = ['Fe%2+%','MnO_4_%-%','H_3_O%+%','','Fe%3+%','Mn%2+%','H_2_O','','','ion fer','permanganate','hydronium',
'ion ferrique','manganèse','eau']

equa = Equations()
e = Equations.get_equation(reactifs)
print(e)
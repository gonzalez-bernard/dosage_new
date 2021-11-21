import os
import sys

sys.path.append(os.getcwd())

import src.modules.utils as utils

print (utils.convertExpoIndice('Fe\u00b2\u207aO\u2081H\u207aSO\u2084\u00B2\u207b',"'","_"))
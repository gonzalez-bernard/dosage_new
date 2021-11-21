import os
import sys

sys.path.append(os.getcwd())

from src.modules.utils import get_interval_index

tab = [2,4,6.3,6.5,8,34,67,87,99]
tab = [x*x for x in range(25)]
print(tab)
print(get_interval_index(tab,0.2,226.5, False))

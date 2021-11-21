"""
Tests problem
"""
import json
#import settings
import sys
import os
from math import log10
path = os.getcwd()
sys.path.append(path)
print(sys.path)

from src.problem.problem import Problem


s = Problem()
s.html = s.getProblem(3)

print(json.dumps(s.html))

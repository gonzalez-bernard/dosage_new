import os
import sys
import numpy as np
import math
import matplotlib.pyplot as plt
from matplotlib.pyplot import *
from scipy.misc import derivative
from scipy import interpolate


#sys.path.append(os.getcwd())
sys.path.append("/home/speedy/developpement/javascript")

from src.modules.utils import get_derive
from src.dosage.Dosage import Dosage

def plot_pH(dos, v_max):
  [v, pH] = dos.calc_phvol(v_max, 0.1)
  [v, yn] = get_derive(v, pH)

  fig, ax1 = plt.subplots()
  plt.xlim(0,v_max)
  grid()
  color = 'tab:red'
  ax1.set_xlabel('volume (mL)')
  ax1.set_ylabel('pH', color=color)
  ax1.plot(v, pH, color=color)
  ax1.tick_params(axis='y', labelcolor=color)

  ax2 = ax1.twinx()  # instantiate a second axes that shares the same x-axis

  color = 'tab:blue'
  ax2.set_ylabel('dpH', color=color)  # we already handled the x-label with ax1
  #xs = np.linspace(0,20,300)
  ax2.plot(v, yn, color=color)
  ax2.tick_params(axis='y', labelcolor=color)

  fig.tight_layout()  # otherwise the right y-label is slightly clipped
  plt.show()
 
dos =  Dosage(0, 0.1, 0.05, 10.0 , [12.7, 9, 6])
v_max = 80.0

plot_pH(dos, v_max)

#title("$H_3PO_4+NaOH$")
            
            
import math
from scipy.optimize import newton
import matplotlib.pyplot as plt
import numpy as np
from scipy.misc import derivative
from scipy.interpolate import InterpolatedUnivariateSpline

def get_ph(type, C1, C2 = None, pK1=None, pK2=None):
  """Calcule le pH connaissant les concentrations

  Args:
      type (int): type d'espèces 0/1: acide/base fort, 2/3:acide/base faible, 4/5:dosage aF/bF, 6/7: dosage af/bf
      C1 (float): concentration espèce 1
      C2 (float, optional): idem. Defaults to None.
      pK1 (float, optional): pKa espèce 1. Defaults to None.
      pK2 (float, optional): pKa espèce 2. Defaults to None.

  Returns:
      float: pH
  """
  Ke = 10**-14

  # définition polynomes
  def f(x):
    return x**3 + a*x*x - b*x - c

  def g(x):
    return x**2 + a*x - b

  def df(x):
    return 3*x*x +2*a*x - b

  def dg(x):
    return 2*x + a

  if type == 0:  # acide fort
    return - math.log10((C1 + math.sqrt(C1*C1 + 4*Ke))/2)
  elif type == 1: # base forte
    return -math.log10((-C1 + math.sqrt(C1*C1 + 4*Ke))/2)
  
  # mise en forme des K
  if type == 3 or type == 7:
    K1 = 10**(pK1-14)
    if pK2:
      K2 = 10**(pK2-14)
  elif type == 2 or type == 6:
     K1 = 10**-pK1
     if pK2:
      K2 = 10**-pK2

  # calcul coefficients
  if type == 2 or type == 3: # mono acide ou mono base faible
    a, b, c = K1, K1*C1 + Ke, Ke*K1
  elif type == 4 or type == 5: # dosage aF/bF ou bF/aF
    a, b = C2-C1, Ke
  elif type == 6 or type == 7: # dosage af/bF ou bf.aF
    a, b, c = C2 + K1, Ke + K1*C1 - K1*C2, Ke*K1

  # methode de Newton
  if type == 2 or type == 6:
    return -math.log10(newton(f, 1, df, tol = 1e-10))
  elif type == 3 or type == 7:
    return 14 + math.log10(newton(f, 0.1, df, tol = 1e-10))
  elif type == 4:
    return -math.log10(newton(g, 1, dg, tol = 1e-10))
  elif type == 5:
    return 14 + math.log10(newton(g, 0.1, dg, tol = 1e-10))
  
def clc_courbePH(type, c1, v1, c2, vmax, pk1 = None, pk2= None):
  v = np.linspace(0,vmax,123)
  pH = np.array([])
  dpH = np.array([])

  def get_ph_dosage(vol, type = 1):
    """Retourne la formule permettant le calcul du pH du dosage acide-fort/base forte

    Args:
        vol (float): volume
        type (int, optional): 1 = dosage d'un acide, 2 = dosage d'une base  Defaults to 1.

    Returns:
        float:  pH
    """
    if type == 1:
      if x < veq-0.1:
        return -math.log10(n1/(v1+x)) -math.log10(1 - x/veq)
      else:
        return 14 + math.log10(n1/(v1+x)) + math.log10(x/veq - 1)    
    else:
      if x < veq-0.1:
        return 14 + math.log10(n1/(v1+x)) + math.log10(1 - x/veq)
      else:
        return -math.log10(n1/(v1+x)) - math.log10(x/veq - 1)

  if type == 1 or type == 2:
    n1 =  c1*v1
    veq = n1/c2
    for x in v:
      if x == veq:
        pH = np.append(pH, 7.0)
        #dpH = np.append(dpH,5)
        #dpH = np.append(dpH, derivative(get_ph_dosage, x, 1e-8, order = 7))
      else:
        pH = np.append(pH, get_ph_dosage(x, type))
        #dpH = np.append(dpH, derivative(get_ph_dosage, x, 1e-12, order = 9))
  else :
    for x in v:
      vt = v1 + x
      ca = c1*v1/vt
      cb = c2*x/vt
      p = ph(type-4, ca , cb, pk1)
      pH = np.append(pH, p)

  sd = InterpolatedUnivariateSpline(v, pH, k=1 )
  spl = sd.derivative()
  fig, ax1 = plt.subplots()

  color = 'tab:red'
  ax1.set_xlabel('volume (mL)')
  ax1.set_ylabel('pH', color=color)
  ax1.plot(v, pH, color=color)
  ax1.tick_params(axis='y', labelcolor=color)

  ax2 = ax1.twinx()  # instantiate a second axes that shares the same x-axis

  color = 'tab:blue'
  ax2.set_ylabel('dpH', color=color)  # we already handled the x-label with ax1
  xs = np.linspace(0,20,300)
  ax2.plot(xs, spl(xs), color=color)
  ax2.tick_params(axis='y', labelcolor=color)

  fig.tight_layout()  # otherwise the right y-label is slightly clipped
  plt.show()

#clc_courbePH(2, 0.1, 10, 0.1, 20, 10)

print(get_ph(0, 0.01)) # OK
print(get_ph(1, 0.00001)) #OK
print(get_ph(2, 0.1, pK1=4.75)) #OK
print(get_ph(3, 0.01, pK1 = 8.)) #OK
print(get_ph(4, 0.1, 0.1)) #OK
print(get_ph(5, 0.10005, 0.1)) #OK
print(get_ph(6, 0.1, 0.1, 1.75))  #OK
print(get_ph(7, 0.1, 0.05, 12.75))

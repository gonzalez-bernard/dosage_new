from math import fabs

class Solution:
  def __init__(self,type, c, pK=[]):
    self.type_reaction = type
    self.c = c
    self.pK = pK
  
  @staticmethod
  def calc_pH(especes, precision):   
    """Calcule le pH d'une solution d'acide ou de base
    On peut aussi avoir un mélange

    Args:
        especes (array(object solution)): tableau d'objets [{'type':t, 'c':c, 'pK':[...]},{}]
        - type : 0 = acide, 1 = base
        - c : concentration
        - pK : tableau des pKa   
        precision (float): precision

    Returns:
        float: pH
    """
    pHmin=0; pHmax=14; pH=7
    eq = 1
    for e in especes:
      e.type = e.type + 2*len(e.pK)
      
    while(fabs(eq) > precision): #(pour une precision de 0,01)
      h = 10**(-pH)
      eq = h-10**(-14)/h  
      for e in especes:
        K = []
        for pk in e.pK:
          K.append(10**-pk)
        if e.type == 1: eq = eq - e.c
        elif e.type == 2: eq = eq + e.c
        elif e.type == 3:  eq = eq-e.c/(1 + h/K[0])
        elif e.type == 4: eq = eq+e.c/(1 + K[0]/h)
        elif e.type == 5:
          m =  K[0]*K[1]
          eq = eq - K[0]*e.c/(h+K[0] + m/h)-2*m*e.c/(h**2+K[0]*h+m)
        elif e.type == 6:
          m =  K[0]*K[1] 
          eq = eq + (e.c*h/K[1])/(1+h/K[1]+h**2/(m))+(2*h**2*e.c/m)/(1+h/K[1]+h**2/m)
      if eq == 0 : break
      if eq<0: 
        pHmax=pH 
      else:
        pHmin=pH
      pH=(pHmin+pHmax)/2
    return pH
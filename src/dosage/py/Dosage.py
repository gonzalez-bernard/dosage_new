import sys
import os
import csv
from math import log10, pow

#from scipy.misc import derivative
#from scipy import interpolate
sys.path.append(os.getcwd())
from src.modules.utils import get_ListDict_forPropValue, get_ListTuple_forValue, convertExpoIndice
from src.dosage.py.C import C

sys.path.append(os.getcwd())

class Dosage:
  """Classe dosage

  """
  MSG_ERROR_PRM_LIST = "Le paramètre doit être une liste"
  MSG_ERROR_PRM_NUMBER = "Le paramètre doit être un nombre"

  def __init__(self, type, c1, c2, v1, ve):
    #self.type_reaction = type    # type de réaction 0: acidebase, 1: autres
    
    self.type_reaction = type   # fournit des infos sur la réaction 
    #oxydo 1: simple, 2:retour, 3:exces:
    #acido 0:
    self.type_dosage = None   # indique le type de dosage (voir constates TYPE_xxx)
    self.titre_conc = c1        # concentration titré
    self.titrant_conc = c2        # concentration titrant 
    self.titre_vol_init = v1        # volume titré
    self.titrant_vol = 0          # volume titrant courant
    self.reactif_vol = 0          # volume du réactif supplémentaire initial
    self.reactif_conc = 0          # concentration du réactif
    self.exc_vol = 0              # volume excipient 
    self.exc_conc = 0
    self.v_max = 0      # volume max
    self.vols = []      # liste des volumes
    self.especes = []   # liste des espèces
    self.spectateurs = []
    self.produits = []
    self.coeffs = []
    self.concentrations =[]
    self.conductivites = []
    self.eau_vol = ve
    self.vol_init = v1 + ve
    self.pH = None

  # setters
  def set_exc(self ,c, v, pH=None):
    if c and c != 0:
      self.exc_conc = c
      self.exc_vol = v
      #self.vol_init = self.vol_init + v
      self.pH = -log10(self.exc_conc*self.exc_vol/self.vol_init)
    elif pH != None and isinstance(pH,(int,float)):
      self.pH = pH
      self.exc_conc = pow(10,-self.pH)
    else:
      self.pH = 7
      self.exc_conc = pow(10,-self.pH)

  def set_coeffs(self, coeffs):
    assert isinstance(coeffs, list), "Le paramètre doit être une liste"
    self.coeffs = coeffs

  def set_potentiels(self, potentiels):
    self.potentiels = potentiels
    
  def set_produits(self, produits):
    """Ajoute les produits

    Args:
        produits (list(dict)): liste des produits
    """
    assert isinstance(produits,list), Dosage.MSG_ERROR_PRM_LIST
    self.produits = produits
  
  # Extrait le tableau des pKa
  def set_pK(self, espece):
    pks = espece['pka'].split(",")
    espece['pka'] = [float(x) for x in pks]

  # Retourne les pKa de l'espèce
  def get_pK(self, reactif):
      """Retourne les pKa de l'espèce

      Ags:
          reactif (int): titre ou titrant

      Returns:
          list: liste des pKa
      """
      return self.especes[reactif]['pKa']

  def set_spectateurs(self, specs):
    """Ajoute les espèces spéctatrices

    Args:
        specs (list(list)): liste des ions spectateurs
    """
    assert isinstance(specs,list), Dosage.MSG_ERROR_PRM_LIST
    self.spectateurs = specs

  def set_especes(self, esp):
    """Initie la tableau especes et convertit les chaines pKa en tableau

    Args:
      esp (esp): dictionnaire des espèces
    """
    self.especes = esp
    
    # initialise les pKa
    for espece in esp:
      self.set_pK(espece)

  def set_vmax(self,v):
    assert isinstance(v,int) or isinstance(v,float), Dosage.MSG_ERROR_PRM_NUMBER
    self.v_max = v

  def get_file_conductivites(self):
    """Récupère les conductivites

      Returns:
        List: conductivités
    """
    with open('./static/resources/datas/dosage/conductivites.csv', 'r') as cFile:
      cond = csv.DictReader(cFile, delimiter=',',)

      conductivites = []
      for elt in cond:
        c = float(elt['conductivite'])
        conductivites.append({'f':elt['formule'], 'cd': c})
    
    return conductivites



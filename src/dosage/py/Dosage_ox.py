import os
import sys

sys.path.append(os.getcwd())

import copy
import json
import re
from math import log10, pow, sqrt

import numpy as np
from src.dosage.py.C import C
from src.dosage.py.Dosage import Dosage
from src.modules.utils import (convertExpoIndice, get_ListDict_forPropValue,
                               get_ListTuple_forValue)

""" Principe

type 1 : dosage simple

(titre, stitre) + (titrant, stitrant) + [(exc, sexc)] -> (ptitre, stitre) + ([ptitrant], stitrant)
+ [(pexc, sexc)

On peut calculer au départ : no_titre
  no_stitre = no_titre*rapport_charge(stitre,titre)
  no_exc
  no_sexc = no_exc*rapport_charge(sexc,exc)
  no_reactif = 0
  no_preactif = 0

les variables sont 'ajout' (quantité de titrant versé) et v (volume total)

0: titre n = max(0, no_titre - ajout*c(titre, titrant))
1: titrant 2 cas : si n_titre > 0 => n = 0 sinon n = ajout - no_titre*coeff(titrant, titre)
2: exc 2 cas : si hasExc = 1 => n = n(H) sinon si hasExc = -1 => n = n(OH)
3: reactif : n = 0
4: ptitre : 2 cas : si n_titre > 0 => n = ajout*coeff(ptitre, titrant) sinon => n = no_titre*coeff(ptitre, titre)
5: ptitrant : 2 cas : si n_titre > 0 => n = ajout*coeff(ptitrant, titrant) sinon => n = no_titre*coeff(ptitrant, titre)
6: pexc : inutilisé
7: preactif : n = 0
8: stitre: no_stitre
9: stitrant: ajout*rapport_charge(stitrant,titrant)
10:sexc: no_sexc
11:sreactif : n = 0
12: H : calculé avec exc
13: OH : calculé par rapport à H

type 2 : dosage retour

Le réactif en excès réagit avec le titre. On dose le réactif en excès avec le titrant

réaction 1 : titre + reactif + [exc] -> ptitre + preactif + [pexc]

réaction 2 : reactif + titrant + [exc] ->  preactif + ptitrant + [pexc]

On calcule au départ no_titre versé, 
  no_stitre = no_titre*rapport_charge(stitre,titre)
  no_exc = n_exc(versé) - no_titre*coeff(exc,titre) ou calcul H+
  no_sexc = n_exc(versé)*rapport_charge(sexc,exc)
  no_reactif = n_reactif(versé) - no_titre*coeff(reactif_0, titre)
  no_preactif = no_titre*coeff(preactif_0,titre)
  no_sreactif = n_reactif(versé)*rapport_charge(sreactif,reactif)
  no_ptitre = no_titre*coeff(ptitre, titre)

0: titre : n = 0 car consommé avec le réactif en excès
1: titrant : 2 cas si n_reactif > 0 => n = 0 sinon => n = ajout - no_reactif*coeff(titrant,reactif)
2: exc : si hasExc = 1 => n = n(H) sinon si hasExc = -1 => n = n(OH)
3: reactif : max(0, no_reactif - ajout*coeff(reactif, titrant))
4: ptitre : no_ptitre
5: ptitrant : 2 cas si n_reactif > 0 => n = ajout*coeff(ptitrant, titrant) sinon => n = no_reactif*coeff(ptitrant, reactif)
6: pexc : inutilisé
7: preactif : 2 cas si n_reactif > 0 => n = no_preactif + ajout*coeff(preactif*titrant) sinon => n = no_preactif + no_reactif*coeff(preactif,reactif)
8: stitre : no_stitre
9: stitrant : ajout*rapport_charge(stitrant,titrant)
10:sexc: no_sexc
11:sreactif : no_sreactif
12: H : calculé avec exc
13: OH : calculé par rapport à H

type 3 : dosage en excès

Le réactif en excès produit preactif que l'on dose

réaction 1 : titre + reactif + [exc] -> ptitre + preactif + [pexc]

réaction 2 : preactif + titrant + [exc] -> reactif + ptitrant + [pexc]

On calcule au départ no_titre, 
  no_stitre = no_titre*rapport_charge(stitre,titre)
  no_ptitre = no_titre*coeff(ptitre, titre)
  no_exc = n_exc(versé) - no_titre*coeff(exc,titre)
  no_sexc = n_exc(versé)*rapport_charge(sexc,exc)
  no_reactif = n_reactif(versé) - no_titre*coeff(reactif_0, titre)
  no_sreactif = n_reactif(versé)*rapport_charge(sreactif,reactif)
  no_preactif = no_titre*coeff(preactif,titre)

0: titre : n = 0 car consommé avec le réactif en excès
1: titrant : 2 cas si n_preactif > 0 => n = 0 sinon => n = ajout - no_preactif*coeff(titrant,preactif)
2: exc : si hasExc = 1 => n = n(H) sinon si hasExc = -1 => n = n(OH)
3: reactif : 2 cas si n_preactif > 0 => n = no_reactif + ajout*coeff(reactif, titrant)) sinon => n = no_reactif + no_preactif*coeff(reactif, preactif)
4: ptitre : n = no_ptitre
5: ptitrant : 2 cas si n_preactif > 0 => n = ajout*coeff(ptitrant, titrant) sinon => n = no_preactif*coeff(ptitrant, reactif)
6: pexc :inutilisé
7: preactif : n = max(0,no_preactif - ajout*coeff(preactif,titrant))
8: stitre : no_stitre
9: stitrant : ajout*rapport_charge(stitrant,titrant)
10:sexc: no_sexc
11:sreactif : no_sreactif
12: H : calculé avec exc
13: OH : calculé par rapport à H
"""

class Dosage_ox(Dosage):

  def __init__(self, type, c1, c2, v1, ve):
    Dosage.__init__(self, type, c1, c2, v1, ve)
    self.reactifs = []

  # Calcule les conductances et concentrations en fonction du volume
  def main(self, dv):
    """Calcule les conductances en fonction du volume
      Args:
        dv (Float): variation élémentaire de volume

      Returns:
        List[list]: liste (volume, conductance)
    """
    assert isinstance(dv, float), "variation de volume doit être numérique"
    assert dv > 0, "variation de volume positive"
    assert dv < self.v_max, "variation de volume trop grande"

    # On récupère les conductivités
    if len(self.conductivites) == 0:
      self.conductivites = self.get_file_conductivites()

    # calcul nombre de points, vols correspond au volume total en cours
    self.vols = np.arange(0,self.v_max, dv) + self.vol_init

    # détecte s'il y a un réactif nécessaire (exc)
    self.hasExc = self.getExc()

    # détecte s'il y a un produit titrant (cas où on n'a qu'un seul produit, par ex : précipitation)
    self.hasPTitrant = len(self.produits) > 1
    
    return self.calc_valeurs()

  def getExc(self):
    """détecte s'il y a un réactif nécessaire (exc)
     
    hasExc vaut 0 : pas d'exc, 1 si H3O+ et -1 si HO- ou 0 si H2O
    Returns:
        [int]: []
    """
    # hasExc = 0

    if not isinstance(self.coeffs[0],list):
      # une seule réaction
      if len(self.reactifs) == 3:
        return self.reactifs[2][1]  # correspond à la charge électrique
    else:
      if len(self.reactifs[0]) == 3:
        return self.reactifs[0][2][1]

  def get_charge(self,type, espece):
    """Retourne la charge électrique

    Args:
        type (int): 0=réactifs, 1=produits, 2=spectateurs
        espece (int): 0=titre, 1=titrant, 2=exc, 3 = réactif
    """
    if type == 0:
      return self.reactifs[espece][1]
    elif type == 1:
      return self.produits[espece][1]
    else:
      return self.spectateurs[espece][1]

  def set_reactifs(self, reactifs):
    """Ajoute les réactifs

    Args:
        reactifs (list(dict)): liste des réactifs
    """
    assert isinstance(reactifs,list), Dosage.MSG_ERROR_PRM_LIST
    self.reactifs = reactifs

  def set_reactif(self, c, v):
    """Initie le réactif

    Args:
        c (float): concentration
        v (float): colume
    """
    self.reactif_conc = c
    self.reactif_vol = v

  def reduce_list(self,tab):
    """ Réduction des listes (reactifs, produits et spec en une)
    On passe de listes de liste à liste uniques
    l'ordre est : titré, titrant, exc, reactif

    Args:
        tab (list): lites de réactifs, produits ou spectateurs
    """
    tab.append(tab[0][0])  # titre
    tab.append(tab[1][1])  # titrant
    if len(tab[0])>2:
      tab.append(tab[0][2])
    else:
      tab.append([])
    tab.append(tab[0][1])  # reactif
    del tab[0:2]

  def calc_acidite_initial(self):
      """Calcule les concentrations H+, OH- et spectateur lié à l'acidité
      On compense la différence entre les concentrations en H+ et OH- par une espèce adaptée
      si [H+] > [OH-] on ajoute des chlorures Cl-
      si [H+] < [OH-] on ajoute des sodium Na+
      si pH est donné on l'utilise pour le calcul, sinon on utilise la concentration et le volume
      initial en H+
      Returns:
          float: concentration en H+, OH- et supp
      """
      if self.hasExc:
        if self.hasExc == 1:
          c_h = self.exc_conc*self.exc_vol/self.vol_init
          c_w = pow(10,-14)/c_h
        else:
          c_w = self.exc_conc*self.exc_vol/self.vol_init
          c_h = pow(10,-14)/c_w
      else:
        c_h = pow(10,-self.pH)
        c_w = pow(10,-14)/c_h
      
      return (c_h,c_w, abs(c_h-c_w))
     
  def calc_conductance(self, conc):

    def _get_conductance(indice, tab = None, index = None):
      """Calcule la conductance d'une espèce

      Args:
          indice (int): indice de l'espèce dans le tableau concentrations 'conc'
          tab (list): tableau réactifs, produit ou spectateur
          index (int): type de l'espece titre = 0, titrant = 1, exc = 2, reactif = 3

      Returns:
          floa: conductance
      """
      if indice == C.E_H:
        return conc[C.E_H] * self.conductivites[get_ListDict_forPropValue(self.conductivites,'f',"H_3_O'+'")[0]]['cd']
      elif indice == C.E_OH:
        return conc[C.E_OH] * self.conductivites[get_ListDict_forPropValue(self.conductivites,'f',"HO'-'")[0]]['cd']
      elif conc[indice] > 0 and len(tab)> index and len(tab[index])>0 and tab[index][1] != 0:
        x = convertExpoIndice(tab[index][0],"'","_")
        id = get_ListDict_forPropValue(self.conductivites,'f',x)[0]
        return conc[indice] * self.conductivites[id]['cd']
      else:
        return 0

    cd = 0.0
    cd += _get_conductance(C.E_TITRE,self.reactifs,C.TITRE)
    cd += _get_conductance(C.E_TITRANT,self.reactifs,C.TITRANT)
    cd += _get_conductance(C.E_REACTIF,self.reactifs,C.REACTIF)
      
    cd += _get_conductance(C.E_PTITRE,self.produits,C.TITRE)
    if self.hasPTitrant:
      cd += _get_conductance(C.E_PTITRANT,self.produits,C.TITRANT)
    cd += _get_conductance(C.E_PREACTIF,self.produits,C.REACTIF)
      
    cd += _get_conductance(C.E_STITRE,self.spectateurs,C.TITRE)
    cd += _get_conductance(C.E_STITRANT,self.spectateurs,C.TITRANT)
    cd += _get_conductance(C.E_SEXC,self.spectateurs,C.EXC)
    cd += _get_conductance(C.E_H)
    cd += _get_conductance(C.E_OH)
    
    if self.type_reaction != C.TYPE_SIMPLE:
      cd += _get_conductance(C.E_SREACTIF,self.spectateurs,C.REACTIF)
      
    
    return cd

  def get_coeffs(self, e1, e2):  
    """Calcule le rapport des coefficients entre 2 espèces
    Utilise la répartition des coefficients
    Si une seule réaction, coeffs est une liste : TITRE=0, TITRANT = 1, EXC = 2, PTITRE = 2 ou 3
    PTITRANT = 3 ou 4
    Si 2 réactions coeffs est une liste de liste
    coeffs[0] : TITRE = 0, REACTIF_0 = 1, EXC = 2, PTITRE = 2 ou 3, PREACTIF_0 = 3 ou 4, PEXC = 5
    si type = 2 :
    coeffs[1] : REACTIF_1A = 0, TITRANT = 1, EXC = 2, PREACTIF_1A = 2 ou 3, PTITRANT = 3 ou 4, PEXC = 5
    si type = 3 :
    coeffs[1] : PREACTIF_1B = 0, TITRANT = 1, EXC = 2, REACTIF_1B = 2 ou 3, PTITRANT = 3 ou 4, PEXC = 5
    
    Args:
        esp_fin (string): espece finale
        esp_ini (string): espece initiale
    Return (int) 
    """

    # calcul offset
    offset = 1 if self.hasExc else 0
    reac_unique = not isinstance(self.coeffs[0],list)

    def _get_coeff(e1):
      if e1 == C.C_TITRE:
        return self.coeffs[0] if reac_unique  else self.coeffs[0][0]
      if e1 == C.C_TITRANT:
        return self.coeffs[1] if reac_unique else self.coeffs[1][1]
      if e1 == C.C_EXC:
        return self.coeffs[2] if reac_unique else self.coeffs[0][2]
      if e1 == C.C_REACTIF_0:
        return self.coeffs[0][1]
      if e1 == C.C_REACTIF_1:
        return self.coeffs[1][0] if self.type_reaction == C.TYPE_RETOUR else self.coeffs[1][2+offset]
      if e1 == C.C_PTITRE:
        return self.coeffs[2+offset] if reac_unique else self.coeffs[0][2+offset]
      if e1 == C.C_PTITRANT:
        return self.coeffs[3 + offset] if reac_unique else self.coeffs[1][3+offset]
      if e1 == C.C_PREACTIF_0:
        return self.coeffs[0][3+offset]
      if e1 == C.C_PREACTIF_1:
        return self.coeffs[1][2+offset] if self.type_reaction == C.TYPE_RETOUR else self.coeffs[1][0]
    
    return _get_coeff(e1) / _get_coeff(e2)

  def calc_acidite (self, c):
    """Calcule les concentrations en h et w et 

    Args:
        type (int): 0 : normal et 1 : retour
    """
    S = c[C.E_TITRE] * self.get_charge(C.REAC,C.TITRE)
    S +=  c[C.E_TITRANT] * self.get_charge(C.REAC,C.TITRANT)
    S += c[C.E_PTITRE] * self.get_charge(C.PROD,C.TITRE)
    if self.hasPTitrant:
      S += c[C.E_PTITRANT] * self.get_charge(C.PROD,C.TITRANT)
    S += c[C.E_STITRE] * self.get_charge(C.SPEC,C.TITRE)
    S +=  c[C.E_STITRANT] * self.get_charge(C.SPEC,C.TITRANT)
    # if self.hasExc != 0:
    S +=  c[C.E_SEXC] * self.get_charge(C.SPEC,C.EXC)

    if self.type_reaction != C.TYPE_SIMPLE:
      S += c[C.E_SREACTIF] * self.get_charge(C.SPEC,C.REACTIF)
      S += c[C.E_REACTIF] * self.get_charge(C.REAC,C.REACTIF)
      S += c[C.E_PREACTIF] * self.get_charge(C.PROD,C.REACTIF)   
      
    delta = S*S + 4*pow(10,-14)
    c_h = (-S+sqrt(delta))/2
    c_w = pow(10,-14)/c_h   
    return c_h, c_w       

  def calc_valeurs(self):
    conc = 14*[0]  # concentrations courantes
    concentrations = [] # tableau des dict concentrations pour chaque volume
    conds = []
    potentiels = []


    if self.type_reaction != C.TYPE_SIMPLE:
      self.reduce_list(self.reactifs)
      self.reduce_list(self.produits)
      self.reduce_list(self.spectateurs) 

    def get_rapport_charges(a,b):
      if a == C.E_STITRANT and b == C.E_TITRANT:
        return abs(self.get_charge(C.REAC,C.TITRANT)/self.get_charge(C.SPEC,C.TITRANT))
      if a == C.E_STITRE and b == C.E_TITRE:
        return abs(self.get_charge(C.REAC,C.TITRE)/self.get_charge(C.SPEC,C.TITRE))
      if a == C.E_SREACTIF and b == C.E_REACTIF:
        return abs(self.get_charge(C.REAC,C.REACTIF)/self.get_charge(C.SPEC,C.REACTIF))

    def _calc_valeurs_initiales():
      # titre, ptitre et stitre
      no[C.E_TITRE] = self.titre_conc * self.titre_vol_init
      no[C.E_STITRE] = no[C.E_TITRE]*get_rapport_charges(C.E_STITRE, C.E_TITRE)
      no[C.E_PTITRE] = no[C.E_TITRE]*self.get_coeffs(C.C_PTITRE,C.C_TITRE)
      no[C.E_REACTIF] = 0
      no[C.E_SREACTIF] = 0
      no[C.E_PREACTIF] = 0

      if self.type_reaction == C.TYPE_RETOUR or self.type_reaction == C.TYPE_EXCES:

        # réactifs, sreactif, preactif
        no[C.E_REACTIF] = self.reactif_conc * self.reactif_vol - no[C.E_TITRE]*self.get_coeffs(C.C_REACTIF_0,C.C_TITRE)

        # dosage impossible
        if no[C.E_REACTIF] <= 0:
          return False

        no[C.E_SREACTIF] = self.reactif_conc * self.reactif_vol * get_rapport_charges(C.E_SREACTIF, C.E_REACTIF)

        no[C.E_PREACTIF] = no[C.E_TITRE]*self.get_coeffs(C.C_PREACTIF_0, C.C_TITRE)
    
 
      # quantité matière excipient H+
      # concentration H3O+ et HO- et excipent spectateur
      (conc[C.E_H], conc[C.E_OH], c) = self.calc_acidite_initial()   
      if self.hasExc and self.hasExc != 0:     # il y a un excipient H30+ ou HO-, cas contraire H2O
        conc[C.E_EXC] = conc[C.E_H] if self.hasExc == 1 else conc[C.E_OH] 
      else:
        conc[C.E_EXC] = 0
      # par défaut
      conc[C.E_SEXC] = c   # le spectateur correspond à Cl- ou Na+
      no[C.E_EXC] = conc[C.E_EXC]*self.vol_init
      no[C.E_SEXC] = abs(conc[C.E_H]-conc[C.E_OH])*self.vol_init
      no[C.E_OH] = conc[C.E_OH]*self.vol_init
      no[C.E_H] = conc[C.E_H]*self.vol_init 

      # test si exc suffisant
      if self.hasExc and no[C.E_EXC]*self.get_coeffs(C.C_TITRE, C.C_EXC) < no[C.E_TITRE]:
        return False

      return True
   
    def _calc_conc_simple():
      conc[C.E_TITRE] = max(0, no[C.E_TITRE]-ajout*self.get_coeffs(C.C_TITRE,C.C_TITRANT))/v
      conc[C.E_REACTIF] = 0
      conc[C.E_PREACTIF] = 0
      conc[C.E_SREACTIF] = 0
      conc[C.E_STITRE] = no[C.E_STITRE]/v
      conc[C.E_SEXC] = no[C.E_SEXC]/v
      conc[C.E_STITRANT] = ajout*get_rapport_charges(C.E_STITRANT, C.E_TITRANT)/v

      if conc[C.E_TITRE] > 0:
        conc[C.E_TITRANT] = 0
        #conc[C.E_EXC] = (no[C.E_EXC] - ajout*self.get_coeffs(C.C_EXC, C.C_TITRANT))/v if self.hasExc else 0    
        conc[C.E_PTITRE] = ajout*self.get_coeffs(C.C_PTITRE, C.C_TITRANT)/v

        # si ptitrant existe
        if self.hasPTitrant:
          conc[C.E_PTITRANT] = ajout*self.get_coeffs(C.C_PTITRANT, C.C_TITRANT)/v
        #conc[C.E_PEXC] = ajout*self.get_coeffs(C.C_EXC, C.C_TITRANT)/v
        
      else:
        conc[C.E_TITRANT] = (ajout - no[C.E_TITRE]*self.get_coeffs(C.C_TITRANT, C.C_TITRE))/v
        #conc[C.E_EXC] = no[C.E_TITRE]*self.get_coeffs(C.C_EXC, C.C_TITRE)/v if self.hasExc else 0
        
        conc[C.E_PTITRE] = no[C.E_TITRE]*self.get_coeffs(C.C_PTITRE, C.C_TITRE)/v
        if self.hasPTitrant:
          conc[C.E_PTITRANT] = no[C.E_TITRE]*self.get_coeffs(C.C_PTITRANT, C.C_TITRE)/v
        #conc[C.E_PEXC] = no[C.E_TITRE]*self.get_coeffs(C.C_PEXC, C.C_TITRE)/v
      
    """ Calcule les concentrations pour un dosage retour (type = 2)
          réaction N°1 : titre + reactif + (exc) -> ptitre + preactif + (pexc)
          réaction N°2 : preactif + titrant + (exc) -> reactif + ptitrant + (pexc)
    """
    def _calc_conc_exces():
      conc[C.E_TITRE] = 0 # consommé lors de la réaction N°1
      conc[C.E_PREACTIF] = max(0, no[C.E_PREACTIF] - ajout * self.get_coeffs(C.C_PREACTIF_1, C.C_TITRANT))/v  # préactif initial - celui consommé réaction N°2
      conc[C.E_PTITRE] = no[C.E_PTITRE]/v 
      conc[C.E_STITRE] = no[C.E_STITRE]/v
      conc[C.E_STITRANT] = ajout * get_rapport_charges(C.E_STITRANT,C.E_TITRANT)/v
      conc[C.E_SEXC] = no[C.E_SEXC]/v 
      conc[C.E_SREACTIF] = no[C.E_SREACTIF]/v

      if conc[C.E_PREACTIF] > 0:  # il reste du préactif
        conc[C.E_TITRANT] = 0
        conc[C.E_PTITRANT] = ajout*self.get_coeffs(C.C_PTITRANT, C.C_TITRANT)/v
        conc[C.E_REACTIF] = (no[C.E_REACTIF] + ajout*self.get_coeffs(C.C_REACTIF_1, C.C_TITRANT))/v

      else:  
        conc[C.E_TITRANT] = (ajout - no[C.E_PREACTIF]*self.get_coeffs(C.C_TITRANT, C.C_PREACTIF_1))/v
        conc[C.E_PTITRANT] = (no[C.E_PREACTIF]*self.get_coeffs(C.C_PTITRANT, C.C_PREACTIF_1))/v
        conc[C.E_REACTIF] = (no[C.E_REACTIF] + no[C.E_PREACTIF]*self.get_coeffs(C.C_REACTIF_1, C.C_PREACTIF_1))/v


    """ Calcule les concentrations pour un dosage retour (type = 2)
        réaction N°1 : titre + reactif + (exc) -> ptitre + preactif + (pexc)
        réaction N°2 : reactif + titrant + (exc) -> preactif + ptitrant + (pexc)
    """
    def _calc_conc_retour():
      conc[C.E_TITRE] = 0 # consommé lors de la réaction N°1
      conc[C.E_REACTIF] = max(0,no[C.E_REACTIF] - ajout * self.get_coeffs(C.C_REACTIF_1,C.C_TITRANT))/v # réaction N°2 le réactif restant est consommé 
      conc[C.E_PTITRE] = no[C.E_PTITRE]/v
      conc[C.E_STITRE] = no[C.E_STITRE]/v
      conc[C.E_STITRANT] = ajout * get_rapport_charges(C.E_STITRANT,C.E_TITRANT)/v
      conc[C.E_SEXC] = no[C.E_SEXC]/v
      conc[C.E_SREACTIF] = no[C.E_SREACTIF]/v

      if conc[C.E_REACTIF] > 0: # il reste du réactif
        conc[C.E_TITRANT] = 0  # le titrant est consommé
        conc[C.E_PTITRANT] = ajout*self.get_coeffs(C.C_PTITRANT, C.C_TITRANT)/v # le titrant consommé donne ptitrant
        conc[C.E_PREACTIF] = (no[C.E_PREACTIF] + ajout*self.get_coeffs(C.C_PREACTIF_1, C.C_TITRANT) )/v # quantité initiale (réaction N°1) + celle produite
      else:  # tout le réactif est épuisé
        conc[C.E_TITRANT] = (ajout - no[C.E_REACTIF]*self.get_coeffs(C.C_TITRANT, C.C_REACTIF_1))/v # quantité ajouté - quantité consommé pour épuiser le réactif restant
        conc[C.E_PTITRANT] = no[C.E_REACTIF]*self.get_coeffs(C.C_TITRANT, C.C_REACTIF_1)/v # limite atteinte 
        conc[C.E_PREACTIF] = (no[C.E_PREACTIF] + no[C.E_REACTIF]*self.get_coeffs(C.C_PREACTIF_1, C.C_REACTIF_1))/v  # preactif initial + celui produit dans la réactio N°2


    # Initialisation des quantités
    no = [0]*14
    v = _calc_valeurs_initiales()

    if v == False:
      return (0,0,0,0)

    # Ajout spectateur Exc
    if self.hasExc == None:
      # cas où il n'y a pas de ptitrant
      if len(self.spectateurs) == 2:
        self.spectateurs.append([])
      if no[C.E_H] > no[C.E_OH]:
        self.spectateurs[2] = ["Cl'-'",-1,{'Cl':1}]
      else:
        self.spectateurs[2] = ["Na'+'",1,{'Na':1}]

    # calcul des conductances
    for v in self.vols:
      # volume et quantité ajoutés 
      va = v - self.vol_init
      ajout = self.titrant_conc * va

      # si dosage simple
      if self.type_reaction == C.TYPE_SIMPLE:
        _calc_conc_simple()
        
      elif self.type_reaction == C.TYPE_EXCES:
        _calc_conc_exces()

      elif self.type_reaction == C.TYPE_RETOUR:
        _calc_conc_retour()
        
      if self.type_reaction == C.TYPE_SIMPLE:

        # calcul potentiel
        if len(self.potentiels) > 0 and va > 0:

          # si avant équivalence
          if conc[C.E_TITRE] > self.titre_conc/1000000:
            # On récupère le nombre d'électrons transféré
            r = self.potentiels[0][1]
            # On calcule le potentiel
            E = self.potentiels[0][0]
            E = E + 0.06/r * log10(conc[C.E_PTITRE]/conc[C.E_TITRE])
          elif conc[C.E_TITRANT] > 0:
            # On calcule le nombre d'électrons transféré
            r = self.potentiels[1][1]
            # On calcule le potentiel
            E = self.potentiels[1][0] + 0.06/r * log10(conc[C.E_TITRANT]/conc[C.E_PTITRANT])
          else:
            rtitre = self.potentiels[0][1]
            rtitrant = self.potentiels[1][1]
            E = (rtitrant*self.potentiels[0][1]+rtitre*self.potentiels[0][0])/(rtitre+rtitrant)
          potentiels.append(E)

      # concentration en ions H+ ou OH-
      # Exc = H+, donc on calcule la variation de H+, on en déduit celle de OH
      conc[C.E_H], conc[C.E_OH] = self.calc_acidite(conc)

      if self.hasExc and self.hasExc != 0:   
        conc[C.E_EXC] = conc[C.E_H] if self.hasExc == 1 else conc[C.E_OH]
          

      """
      if self.hasExc == -1:   # Exc = H2O, on calcule la variation de OH- (produit)
        if conc[C.E_TITRE] > 0:
          conc[C.E_OH] = self.calc_concentration(C.E_OH, v, n_w, n_ajout)
          conc[C.E_H] = pow(10,-14)/conc[C.E_OH]
        else:
          (conc[C.E_H], conc[C.E_OH]) = self.calc_acidite(conc)
      """

      # Calcule conductance
      cd = self.calc_conductance(conc)
      concentrations.append(copy.deepcopy(conc))
      conds.append(copy.deepcopy(cd))


    # enlève volume titré et réactif pour tracé du graphe
    vols = list(map(lambda x: x-self.vol_init, self.vols))
    return [vols, conds, concentrations, potentiels] 
    
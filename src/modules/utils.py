import os
import re
import math
import numpy as np
from scipy import interpolate #pylint: disable=E0401

def get_sign(val):
    """Retourne le signe d'un nombre

    Args:
        val (int|float): nombre à analyser
    
    Returns:
        int : +1, -1 ou 0
    """
    if val == 0:
        return 0
    else:
        return val/abs(val)
        
def getFilePath(fichier, rep):
    """
    Recherche le chemin d'un fichier
    :param fichier: {str} nom du fichier
    :param rep: {url} chemin du dossier de base
    :return: {str}
    """
    # recherche du contenu du répertoire rep (fichiers et sous-répertoires)
    entrees = os.listdir(rep)

    # traitement des fichiers du répertoire
    for entree in entrees:
        if (not os.path.isdir(os.path.join(rep, entree))) and (entree == fichier):
            return rep

    # traitement récursif des sous-répertoires de rep
    for entree in entrees:
        rep2 = os.path.join(rep, entree)
        if os.path.isdir(rep2):
            chemin = getFilePath(fichier, rep2)
            if chemin:
                return chemin

def convert_case(string):
    """Convertit une formule chaine pour tenir compte des indices et exposants chiffrés
    ex: H_2_SO_3_'-' 

    Args:
        string (str): chaine au format suivant _indice_ et 'exposant'
    Return:
        str : chaîne formatée
    """
    sup = ['\u2070', '\u00B9', '\u00B2', '\u00B3', '\u2074', '\u2075', '\u2076', '\u2077', '\u2078', '\u2079']
    sub = ['\u2080', '\u2081', '\u2082', '\u2083', '\u2084', '\u2085', '\u2086', '\u2087', '\u2088', '\u2089']
    sym = {'+': '\u207a', '-': '\u207b', 'rightarrow': '\u2192'}
    
    def rep_indice(val):
        return sub[int(val.group(1))]

    def rep_exposant(val):
        if len(val.group(1)) == 2:
            return sup[int(val.group(1)[0])]+sym[val.group(1)[1]]
        else:
            return ''+sym[val.group(1)[0]]

    if not isinstance(string, str):
        string = str(string)
    
    chaine = re.sub(r'_(\d)_', rep_indice, string)
    chaine = re.sub(r"'(\d?[+-])'", rep_exposant, chaine)
    return chaine

def get_derive(x,y):

  """Génère les points de la courbe dérivée

  Args:
      x (array(float)): abscisse
      y (array(float)): ordonnée

  Returns:
      Array : [x, dy]
  """
  f = interpolate.PchipInterpolator(x, y, extrapolate=True)
  fn = f.derivative(1)
  yn = fn.__call__(x)
  return [x,yn]

def get_ListTuple_forValue(tab, value):
    """Retourne les indices des tuples présents dans un tableau ayant la valeur indiqué

    Args:
        tab (list): liste des tuples
        value (str|num): valeur cherchée

    Returns: liste des indices ou -1 si pas trouvé
    """
   
    ind =  []
    for i in range(len(tab)):
        if value in tab[i]:
            ind.append(i)
    return ind if len(ind) > 0 else None

def get_ListDict_forPropValue(tab, prop, value):
    """Retourne les index des dict qui possède la propriété avec la bonne valeur

    Si les valeurs présentes dans tab sont codées on les met au format (exposant et indice)
    Args:
        tab (list): list de dict
        prop (str): propriété du dict
        value (str|num): valeur cherché

    Returns:
        list des indices
    """
    ind =  []
    for i in range(len(tab)):
        if prop in tab[i]:
            if value == tab[i][prop]:
                ind.append(i)
    return ind

def convertExpoIndice(txt,symup="'",symdw="_"):
    """Convertit les indices et exposants

    args:
    txt:    str chaine à convertir
    code:   str code utf-8
    symbole str chaine de remplacement

    returns str
    """
    
    sup = ['\u2070', '\u00B9', '\u00B2', '\u00B3', '\u2074', '\u2075', '\u2076', '\u2077', '\u2078', '\u2079']
    sub = ['\u2080', '\u2081', '\u2082', '\u2083', '\u2084', '\u2085', '\u2086', '\u2087', '\u2088', '\u2089']
    #sym = {'+': '\u207a', '-': '\u207b', 'rightarrow': '\u2192'}

    r = ""
    for i in range(len(sup)):
        r = "(\\"+ sup[i] +")"
        txt = re.sub(r,symup+str(i)+symup,txt)
    
    r = ''
    for i in range(len(sub)):
        r = "(\\"+sub[i] +")"
        txt = re.sub(r,symdw+str(i)+symdw,txt)
    
    txt = re.sub('\\u207a',"'"+'+'+"'",txt)
    txt = re.sub('\\u207b',"'"+'-'+"'",txt)

    txt = txt.replace("''","")
    return txt

def maximum(liste):
    maxi = liste[0]
    for i in liste:
        if i >= maxi:
            maxi = i
    return maxi

def minimum(liste):
    mini = liste[0]
    for i in liste:
        if i <= mini:
            mini = i
    return mini

def get_proportional_rows(mat):
    """Analyse une matrie et repère les lignes proportionnelles

    Args:
        mat (np_array): tableau np.array

    Returns:
        array: tableau contenant les indices des lignes proportionnelles
    """
    import numpy
    prop_row = []
    for i in range(len(mat)-1):
        val = None
        multi = True
        for j in range (i+1, len(mat)):
            with numpy.errstate(divide='ignore'):
                try:
                    x = (i, j, numpy.divide(mat[i],mat[j]))
                except FloatingPointError:
                    pass
            val = None
            multi = True
            for e in x[2]:
                if numpy.isreal(e) and not numpy.isnan(e) :
                    if val == None:
                        val = e
                    elif val != e:
                        multi = False
                        break
            if multi and val != None:
                prop_row.append((i,j))
    return prop_row

def del_proportional_rows(mat, other = False):
    """Supprime les lignes proportionnelles dans un np_array

    Args:
        mat (np_array): matrice
        other (bool, optional): indique si on utilise le tableau en cours ou on en crée un noveau. Defaults to False.

    Returns:
        np_array: matrice réduite
    """
    rows = get_proportional_rows(mat)
    if len(rows) > 0:
        if other:
            new_mat = mat.copy()
            for e in reversed(rows):
                new_mat = np.delete(new_mat,e[1],0)
            return new_mat
        else:
            for e in reversed(rows):
                mat = np.delete(mat,e[1],0)
            return mat
    return mat

def get_interval_index(liste, v_min, v_max, exact = True):
    """Retourne les indices des valeurs min et max du tableau

    Args:
        liste (list) : liste à analyser triée 
        min (any): valeur minimale
        max (any): valeur maximale
        exact (bool, optional): indique si on doit avoir les valeurs exactes ou approchantes. Defaults to True.
    
    Returns:
        Tuple (i_min, i_max) ou None
    """

    def _get_index(liste,value, start=0):
        a = start
        b = len(liste)
        while True:
            m = int((a+b)/2)
            x = a-b
            if a == m and liste[m] == value:
                return  m
            
            # si encadrement de la valeur cherchée
            if abs(x) == 1:
                mini = max(0,m-1)    # nécessaire pour effet de bord
                maxi = min(len(liste)-1,m+1)

                # on cherche les écarts
                ecarts.append(abs(liste[mini]-value))
                ecarts.append(abs(liste[m]-value))
                ecarts.append(abs(liste[maxi]-value))
                
                # On cherche l'écart minimal
                ecart_min = min(ecarts)

                # On ajoute à l'indice courant m le décalage (-1,0 ou +1)
                return max(0,min(b,m+ecarts.index(ecart_min)-1))

            # modification des bornes
            if liste[m] > value:
                b = m
            else:
                a = m
    
    if len(liste) == 0:
            return None
    if exact:
        try:
            i_min = liste.index(v_min)
            i_max = liste.index(v_max,i_min)
        except ValueError:
            return None
    else:
        ecarts = []
        # recherche dichotomique
        i_min = _get_index(liste, v_min)
        i_max = _get_index(liste, v_max, i_min)
        
 
    return (i_min, i_max)

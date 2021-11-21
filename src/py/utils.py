import os
import re
import math

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

def formatSignificatif(number, precision, mode = 'e'):
    """
    formate un nombre avec un nombre de chiffres significatifs
    version : 2.0  
    
    Args:
        nombre {float} -- nombre à formater
        precision {int} -- nombre de chiffres significatifs
        mode {str} -- indique si on doit utiliser l'affichage scientifique xxey ou Latex 

    Returns:
        float nombre formaté en décimal si possible sinon en notation scientifique)
        Le nombre est renvoyé sans traitement si precision est négative ou nulle
        ou False si erreur 
    """
    def _get_digit(number):
        """Analyse le nombre

        Args:
            number (float): nombre à analyser

        Returns:
            tuple (nombre avant point, nombre après, nombre de zéros après le point)
        """
        # on cherche les nombres avant et après le point
        s = f"{number:.10f}".split('.')

        # pas de chiffres après le point ou zéros
        if len(s) == 1 or  int(s[1]) == 0:
            return(s[0], 0, 0)
        
        # on cherche le nombre de zéros après le point
        n_zeros = -1
        _number = float("0."+s[1])
        while _number<1:
            _number = _number * 10
            n_zeros = n_zeros + 1
        return(s[0],s[1],n_zeros)

    digits = _get_digit(number)
    if precision <= 0:
        x = number
    else:
        # on calcule le nombre de chiffres à garder à droite
        nc = precision - len(digits[0])
        if digits[0] == "0":
            nc = nc + 1 + digits[2]
        
        # mantisse
        if nc > 0:
            f = "{:."+str(nc)+"f}"
            x = f.format(round(number,nc))
        elif nc == 0:
            x = str(int(round(number,nc)))
        else:
            f = "{:."+str(precision-1)+"e}"
            x = f.format(number)
            if mode != 'e':
                x = scinotation2latex(x)
            
    return x

 
def get_digits(nombre):
    """
    Compte le nombre de chiffres significatifs.
    Malheureusement les zéros à droite ne sont pas comptabilisé
    :param {float} nombre:
    :return: {int} nombre de CS
    """
    s = str(nombre).split(".")
    x = len(s[0].rstrip('0')+s[1]) if len(s) == 2 else len(s[0].rstrip('0'))
    return  x

def scinotation2latex(nombre):
    """
    transforme l'écriture scientifique x.xxEyyy (ex 1.34E+05) et notation scientifique x.xx10y

    :param {str} nombre:
    :return: {str} nombre formaté
    """
    if 'E' in nombre:
        x = nombre.split('E')
    elif 'e' in nombre:
        x = nombre.split('e')
    else:
        return nombre
    x[1] = x[1].replace('+','')
    x[1] = x[1].lstrip('0')
    return x[0] + "\\times 10^{" + x[1] + "}"

def get_random_pwd(size = 12):
    """Génère un mot de passe aléatoire
    
    Args:
        size: taille du mot de passe (default: {12})
    
    Returns:
        {str} mot de passe
    """
    import random
    element = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-*/~$%&.:?!"
    passwd = ""
 
    for i in range(size): 
        passwd = passwd + element[random.randint(0, len(element) - 1)]

    return passwd

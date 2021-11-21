"""
Module Equation
"""

import csv
import math
import numpy as np
import os
import sys

sys.path.append(os.getcwd())

from src.modules.utils import getFilePath

FILE_EQUATIONS = "equations.csv"

sup = ['\u2070', '\u00B9', '\u00B2', '\u00B3', '\u2074', '\u2075', '\u2076', '\u2077', '\u2078', '\u2079']
sub = ['\u2080', '\u2081', '\u2082', '\u2083', '\u2084', '\u2085', '\u2086', '\u2087', '\u2088', '\u2089']
sym = {'+': '\u207a', '-': '\u207b', 'rightarrow': '\u2192'}

# Masses molaires
MASSES_MOLAIRES = {'H': 1.00, 'C': 12.0, 'O': 16.0, 'N': 14.0, 'Cl': 35.5, 'Ca': 40.0, 'Al': 26.0,
                   'Ag': 107.9, 'Br': 79.9, 'Cr': 52.0, 'Cu': 63.5, 'Sn': 118.7, 'Fe': 55.8, 'F': 19.0, 'I': 126.9,
                   'Li': 6.9, 'Mg': 24.3, 'Mn': 54.9, 'Ni': 58.7, 'P': 31.0, 'Pb': 207.0, 'K': 39.1, 'Si': 28.1,
                   'Na': 23.0, 'S': 32.0, 'Zn': 65.4, 'Ba':137.3, 'Y':292, 'Nt':461}



class Equations:
    """Classe Equations

    Fonctions:
        get_equation : Analyse l'équation et retourne l'équation ainsi qu'une liste des réactifs \
            et des produits
        get_equations : Récupère liste des équations à partir du fichier
        _get_coeffs : Extrait les coefficients de la structure équation
        _get_massesmolaires : Calcul des masses molaires
        
    Raises:
        OSError: [description]
        ValueError: [description]

    Returns:
        None:
    """

    def __init__(self):
        pass

    @staticmethod
    def get_equation(equation, sep_exp='%'):
        """Analyse l'équation et retourne l'équation ainsi qu'une liste des réactifs et des produits
        Links: get_equations
        Use: get_equation_non_eq, get_nom_reactifs, get_nom_produits
        Use: equation.get_coeffs, equation.get_massesmolaires, get_equation_equilibree 

        Args:
            equation (equation): tableau contenant les formules des réactifs, des produits, des espèces spectatrices
            et les noms
            sep_exp str caractère marquant un exposant
            
            chaque formule est séparé par une virgule, les exposants (charges) sont encadrés par %...% ou '...'
            les indices sont encadrés par _..._ 
            chaque groupe (réactifs,produits,espèces spectatrices (titre et titrant) sont séparés par un slash '/'.
            les formules et les noms sont séparés par 2 slashs
            ex : 'Fe%2+%','H_3_O%+%','/','Fe%3+%,'H_2_O','/','Cl%-%','/','Na%+%,'//',
            'ion ferreux',hydronium','/',ion ferrique','eau','/','ions chlorure','/','ion sodium'

        Returns:
            structure complexe
            string:  chaine formatée, (list) structure réactifs, (list) structure produits
        """
        eq = Equation()

        # construit équation non équilibrée
        eq.equation_non_equilibree = Equations.get_equation_non_eq(equation, eq, sep_exp)

        # traite les espèces spectatrices ou ajoutées non réactives
        # eq.spec = Equations.get_esp_spectatrices(equation)

        # traite les noms
        eq.nom_reactifs = Equations.get_nom_reactifs(equation)
        eq.nom_produits = Equations.get_nom_produits(equation)

        # calcul des coefficients
        eq.get_coeffs()

        # calcul des masses molaires
        eq.get_massesmolaires()

        # construction équation équilibrée
        eq.get_equation_equilibree()

        # récupère couleurs
        #eq._get_colors()

        return eq

    @staticmethod
    def get_equation_non_eq(equation, eq, sep_exp):
        """Retourne équation non équilibrée

        Link: get_equation
        
        Use: get_molecule

        Args:
            equation (array): structure
            eq (equation): equation
            sep_exp (str): séparateur exposant

        Returns:
            str: [description]
        """
        s_equ = ""
        sep_exp = "'"
        equ = equation[0].split(",")
        for espece in equ:
            espece = Equations.get_molecule(espece,sep_exp)
            eq.reactifs.append(espece)
            s_equ += espece[0] + " + "
        s_equ = s_equ[:-3] + " " + sym['rightarrow'] + " "

        equ = equation[1].split(",")
        for espece in equ:
            espece = Equations.get_molecule(espece,sep_exp)
            eq.produits.append(espece)
            s_equ += espece[0] + " + "

        if len(equation) > 2:
            equ = equation[2].split(",")
            for espece in equ:
                espece = Equations.get_molecule(espece,sep_exp)
                eq.spectateurs.append(espece)
        
        return s_equ[:-3]

    @staticmethod
    def get_molecule(chaine, sep_exp):
        """Analyse une chaine pour extraire les informations d'une molecule

        Use : _get_bloc, _getCharge, _set_lst_char

        Args:
            chaine (str): chaine a analyser
            sep_exp (str) : séparateur exposant

        Returns:
            list: [chaine formatée, charge, dictionnaire {'atome':nombre,...}]
        """

        structure = []
        charge_formate = ''
        lst_char = {}
        last_char = []
        indice = 0
        charge = 0

        def _get_bloc(chaine, indice):
            """Analyse les caractères situés entre les parentheses

            Use: get_molecule

            Args:
                chaine (str): chaine à traiter
                indice (int): indice à partir duquel on analyse

            Returns:
                list: [chaine formatée, bloc caractères, {elt1:nombre,...}]
            """

            indice += 1

            car = chaine[indice]
            if not car.isalpha():
                return False

            last_indice = chaine.find(")", indice)

            return Equations.get_molecule(chaine[indice:last_indice],",")

        def _get_indice(chaine, indice):
            """Analyse la chaine à partir du caractère "_"

            Args:
                chaine (str): chaine a traiter
                indice (int): indice du caractère "_"

            Returns:
                str: chaine formatée, valeur, indice du caractère "_" terminal
            """

            indice += 1
            _valeur, charge_formate = '', ''
            car = chaine[indice]
            if not car.isdigit():
                return False
            while car.isdigit():
                _valeur += car
                charge_formate += sub[int(car)]
                indice += 1
                if indice == len(chaine):
                    break
                car = chaine[indice]
            valeur = int(_valeur)
            return charge_formate, valeur, indice

        def _getCharge(chaine, indice):
            """Analyse chaine pour déterminer la charge

            Args:
            chaine (str): chaine a analyser
            indice (int): indice du caractère "'"

            Returns:
            str: chaine formatée, valeur, indice du caractère suivant la fin
            """
            indice += 1
            charge, charge_formate = '', ''
            char = "%"
            car = chaine[indice]
            if car == '+' or car == "-":
                charge_formate = sym[car]
                charge = 1 - 2 * (car == "-")
                indice += 1
                if indice < len(chaine) and chaine[indice] == char:
                    indice += 1
                return charge_formate, charge, indice

            while chaine[indice].isdigit():
                charge += car
                charge_formate += sup[int(car)]
                indice += 1
                car = chaine[indice]
            charge = int(charge)

            if car == "+" or car == "-":
                charge_formate += sym[car]
                charge = charge * (1 - 2 * (car == "-"))
                indice += 1
                if indice < len(chaine) - 1 and chaine[indice] == char:
                    indice += 1
                return charge_formate, charge, indice

            return False

        def _set_lst_char(lst_char, lst, nombre):
            """Met à jour la liste des caractères

            Args:
                lst_char (list): liste à compléter
                lst (list|dictionnary): liste des caractères
                nombre (int): nombre

            Returns:
                None
            """
            if isinstance(lst, list):
                for _car in lst:
                    if _car in lst_char:
                        lst_char[_car] += nombre
                    else:
                        lst_char.update({_car: nombre})
            else:
                for _car in lst:
                    if _car in lst_char:
                        lst_char[_car] += nombre * lst[_car]
                    else:
                        lst_char.update({_car: nombre * lst[_car]})

        # début fonction get_molecule
        etat = chaine[-3:].lower()
        if etat == '(s)' or etat == '(l)' or etat == '(g)':
            chaine = chaine[:-3]
        elif etat == 'aq)':
            etat = chaine[-4:].lower()
            chaine = chaine[:-4]
        else:
            etat = ''

        while indice < len(chaine):

            car = chaine[indice]
            char = sep_exp

            # fin
            if indice == len(chaine) - 1:
                charge_formate += car
                _set_lst_char(lst_char, [car], 1)
                break

            if car.isalpha():

                car_suivant = chaine[indice + 1]

                # on enregistre le caractère en cours dans tous les cas sauf si \
                # suivi d'une minuscule
                if not car_suivant.islower():
                    charge_formate += car
                    last_char = [car]
                    _set_lst_char(lst_char, last_char, 1)

                # on enregistre les deux caractères
                elif car_suivant.isalpha() and car_suivant.islower():
                    last_char = [car + car_suivant]
                    charge_formate += car + car_suivant
                    _set_lst_char(lst_char, last_char, 1)
                    indice += 1

                else:
                    last_char = [car]

            elif car == char:
                _sf, charge, indice = _getCharge(chaine, indice)
                charge_formate += _sf

            elif car == "_":
                _sf, nombre, indice = _get_indice(chaine, indice)
                charge_formate += _sf
                _set_lst_char(lst_char, last_char, nombre - 1)

            elif car == "(":
                struct = _get_bloc(chaine, indice)
                charge_formate += "(" + struct[0] + ")"
                last_char = struct[2]
                _set_lst_char(lst_char, last_char, 1)
                last_indice = chaine.find(")", indice)
                indice += last_indice - indice

            indice += 1

        structure.append(charge_formate + etat)
        structure.append(charge)
        structure.append(lst_char)
        return structure

    @staticmethod
    def get_equations() -> list:
        """Récupère liste des équations à partir du fichier

        Use: get_equation, equation.get_coeffs, equation_get_equation_equilibree

        Crée la structure pour chaque équation présente dans le fichier csv
        """
        equations = []
        # Ouverture et lecture du fichier
        FILE_EQUATIONS = "equations.csv"
        FILE_EQUATIONS = getFilePath(FILE_EQUATIONS, os.path.abspath(os.getcwd())) + "/" + FILE_EQUATIONS

        try:
            with open(FILE_EQUATIONS, 'r') as eq_file:
                reader = csv.reader(eq_file, delimiter=",")
                for row in reader:
                    # récupère structure
                    equa = Equations.get_equation(row)

                    # récupère les coefficients
                    equa.get_coeffs()

                    # ajoute l'équation avec les coefficients
                    equa.get_equation_equilibree()

                    equations.append(equa)
        
            return equations

        except OSError:
            raise OSError
        except ValueError:
            raise ValueError

    @staticmethod
    def get_esp_spectatrices(equation):
        return equation[2].split(",")

    @staticmethod
    def get_esp_ajoutes(equation):
        return equation[3].split(",")
    
    @staticmethod
    def get_nom_reactifs(equation):
        if len(equation) > 4:
            return equation[4].split(',')

    @staticmethod
    def get_nom_produits(equation):
        if len(equation) > 4:
            return equation[5].split(',')


class Equation:
    """Classe Equation

        Structure des équations
        Tableau avec les différentes informations fournies ou calculées
        0: str - equation non équilibrée
        1: [] - réactifs
        2: [] - produits
        3: [] - nom des réactifs
        4: [] - nom des produits
        5: [] - coefficients
        6: str - équation avec coefficients
        7: [] _ quantités (mol ou g)
        8: int - unité 0 = mol, 1 = g
        9: [] - avancement 0 = stoechio 0 = Non, 1 = xmax, 2 = réactif limitant, 3 = reste (mol) , \
                4 = reste (g)
        10: [] - masses molaires

    """
    def __init__(self):

        self.reactifs = []
        self.produits = []
        self.nom_reactifs = []
        self.nom_produits = []
        self.equation_non_equilibree = ""
        self.equationEquilibre = ""
        self.coeffs = []
        self.massesmolaires = []
        self.colors = []
        self.pH = None
        self.potentiels= []
        #self.reponse = []
        #self.ajout=[]
        self.spectateurs=[]

    def get_especes(self, att: str):
        """Récupère espèces

        Use: _get_frm_reactifs, _get_frm_produits, _get_txt_reactifs, _get_txt_produits

        Args:
            att (str): attributs ex : r0, p1

        Returns:
            str: espèce
        """
        if att[0] == 'r':
            return self._get_frm_reactifs()[att[1]]
        elif att[0] == 'p':
            return self._get_frm_produits()[att[1]]
        elif att[0] == 's':
            if att[1] == 'r':
                return self._get_txt_reactifs()[att[2]]
            else:
                return self._get_txt_produits()[att[2]]

    def get_equation_equilibree(self):
        """Retourne équation équilibrée

        Link: equations.get_equation

        Returns
            str: équation
        """
        equ = ""
        for i in range(len(self.reactifs)):
            equ += str(self.coeffs[i]) + " " + self.reactifs[i][0] + " + "
        equ = equ[0:-3] + " " + sym['rightarrow'] + " "
        _num_reactifs = len(self.reactifs)
        for i in range(len(self.produits)):
            equ += str(self.coeffs[i + _num_reactifs]) + " " + self.produits[i][0] + " + "
        self.equationEquilibre = equ[0:-3]
        return self.equationEquilibre

    def get_coeffs(self):
        """Extrait les coefficients de la structure équation

        construit les matrices. La matrice doit être carrée.
        Le nombre de colonne correspond au nombre d'espèces
        Le nombre de lignes correspond au nombre d'éléments plus la charge
        On ajoute une ligne pour fixer la valeur du premier coefficients
        Si le nombre d'éléments est supérieur ou égal à celui des espèces, il y a une ou des \
            équations redondantes.

        Link: equations.get_equation

        Use: _get_matrix_charge, _get_matrix, _get_lst_elements, _normalize

        Args:
            equation (tuple): équation

        Returns:
            tuple: retourne un tuple des matrices des coefficients
        """

        def _get_matrix_charge():
            """Analyse l'équation et retourne Vrai ou Faux selon la charge

            Args:
                None

            Returns:
                bool: Vrai si charge non nulle
            """
            charge = False
            for reactifs in self.reactifs:
                if reactifs[1] != 0:
                    charge = True
                    break

            return charge

        def _get_matrix(elts, mat_a, mat_c):
            """Retourne les matrices des coefficients

            Args:
                elts (str): chaine des éléments
                mat_a (ndarray): tableau des coefficients
                mat_c (ndarray): tableau des charges

            Returns:
            list : mat_a, mat_c
            """
            n_col = 0
            signe = 1

            for reactifs in self.reactifs:
                elements = reactifs[2]
                charge = reactifs[1]
                for element in elements:
                    n_row = elts.index(element) + 1
                    mat_a[n_row][n_col] = signe * elements[element]
                    mat_c[n_col] = signe * charge
                n_col += 1
            signe = -signe
            for produits in self.produits:
                elements = produits[2]
                charge = produits[1]
                for element in elements:
                    n_row = elts.index(element) + 1
                    mat_a[n_row][n_col] = signe * elements[element]
                    mat_c[n_col] = signe * charge
                n_col += 1
            signe = -signe

            return mat_a, mat_c

        def _get_lst_elements():
            """Retourne la liste des éléments

            Returns:
                str: elts
            """
            elts = []
            for reactifs in self.reactifs:
                elements = reactifs[2]
                for element in elements:
                    if element not in elts:
                        elts.append(element)

            return elts

        def _normalize(lst):
            """Normalise la matrice en mettant tous les coefficients sous forme d'entiers

            Args:
                lst (list): liste des coefficients

            Returns:
                list: liste des coefficients
            """

            def is_int(lst, pos):
                for elt in lst:
                    if not math.isclose(round(pos * elt), pos * elt, rel_tol=0.01):
                        return False
                return True

            _pos = 1
            while not is_int(lst, _pos):
                _pos += 1

            return [int(round(_pos * elt)) for elt in lst]


        # extrait liste elements
        elts = _get_lst_elements()

        # calcul de la charge
        charge = _get_matrix_charge()

        nb_molecules = len(self.reactifs) + len(self.produits)
        nb_elements = len(elts) + (charge is True) +1
        mat_a = np.zeros((nb_elements, nb_molecules))
        mat_b = np.zeros((nb_elements,))
        mat_c = np.zeros((nb_molecules,))
        mat_b[0] = 1
        mat_a[0][0] = 1

        _get_matrix(elts, mat_a, mat_c)

        if charge:
            mat_a[nb_elements-1] = mat_c

        dim = mat_a.shape
        
        # si matrice carré (autant d'éléments que de coefficients)
        if dim[0] == dim[1]:
            coeffs = np.linalg.solve(mat_a, mat_b)
        else:
            coeffs = np.linalg.lstsq(mat_a, mat_b, rcond=None)[0]

        # cherche les valeurs entières
        self.coeffs = _normalize(coeffs)
        return self.coeffs

    def get_massesmolaires(self):
        """Calcul des masses molaires

        Link: Equations.get_molecule

        Use: _get_massemolaire

        Returns:
            list: liste des masses
        """

        def _get_massemolaire(formule):
            """Calcule la masse molaire

            Args:
                formule (dict): structure issu de self.current_equation

            Returns:
                int: masse molaire
            """
            _masse = 0
            for k in formule.keys():
                _masse += formule[k] * MASSES_MOLAIRES[k]

            return round(_masse,1)

        reac = self.reactifs
        prod = self.produits

        # Calcul des masses molaires
        m_reactifs = [_get_massemolaire(reac[i][2]) for i in range(len(reac))]
        m_produits = [_get_massemolaire(prod[i][2]) for i in range(len(prod))]
        masses_molaires = m_reactifs + m_produits
        self.massesmolaires = masses_molaires

    def _get_txt_equilibre(self):
        """Retourne l'équation équilibrée

        Use: get_equation_equilibree

        Returns:
            str
        """
        return self.equationEquilibre if self.equationEquilibre != '' else \
            self.get_equation_equilibree()

    def _get_txt_brut(self):
        """Retourne l'équation non équilibrée

        Returns:
            str
        """
        return self.equation_non_equilibree

    def _get_frm_reactifs(self):
        """Retourne la liste des formules des réactifs

        Returns:
            list
        """
        liste = []
        for elt in self.reactifs:
            liste.append(elt[0])
        return  liste

    def _get_frm_produits(self):
        """Retourne la liste des formules des produits

        Returns:
            list
        """
        liste = []
        for elt in self.produits:
            liste.append(elt[0])
        return  liste

    def _get_txt_reactifs(self):
        """Retourne la liste des noms des réactifs

        Returns:
            list
        """
        return self.nom_reactifs

    def _get_txt_produits(self):
        """Retourne la liste des noms des produits

        Returns:
            list
        """
        return self.nom_produits

    '''
    def _get_colors(self):
        liste = []
        liste.append(self.ctitre)
        liste.append(self.ctitrant)
        liste.append(self.cfinale)
        #if self.ccourant:
        liste.append(self.ccourant)
        return liste
    '''
    
    @staticmethod
    def dict2equation(dic):
        """Initialise les attributs de l'équation avec les valeurs du dictionnaire

        Link: avan
        Args:
            dic (dict): valeurs à àinsérer

        Returns:
            Equation: équation
        """
        equ = Equation()
        for key, value in dic.items():
            setattr(equ,key,value)
        return equ

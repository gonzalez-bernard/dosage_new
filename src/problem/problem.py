"""
Class Problem
"""
import re
import os
import sys
sys.path.append(os.getcwd())
from random import randrange, uniform
import xmltodict
import json
import math, random


# import src.py.constantes as cst
from src.py.utils import getFilePath, formatSignificatif, get_digits
from src.environnement.files import FILE_PROBLEMS

class Problem:
    """Gestion des problèmes
    Description du fichier 'problem.xml'
        Utilise le fichier 'problems.xml' structuré de la façon suivante :
            <problem id='...'>
            <level>...</level>
            <type...</type>
            <objectif>...</objectif>
            <context>...</context>
            <question>...</question>
            <donnees>...</donnees>
            <inconnu>...</inconnu>
            <help>...</help>
        </problem>

        Les variables sont entourées de '#...#'
        On dispose de :
            - #ct# et #ci# pour les concentrations des titrant (t) et titré (i)
            - #vt# et #vi# pour les concentrations des titrant (t) et titré (i)
            - #mt# et #mi# pour les masses
            - #cr# et #vr# pour les concentrations et volumes du réactif

        L'item 'données' permet le calcul de toues les grandeurs avec la syntaxe :
            - grandeur = ! : calcul automatique ou grandeurs en mémoire
            - grandeur = formule, par ex : round(uniform(1,2),1)

        L'item 'inconnu' précise la valeur à trouver

        L'item "help" utilise MathJax. La syntaxe pour les formules est :
            - inline : \\(...\\)
            - block : $$...$$
            - les balises de formatage html sont encadrées par des crochets [...]

    Fonctions:
        - get_problems : récupère la liste des problèmes
        - get_problem : Choisit un problème aléatoire ou identifié par son indice.
        - get_attributes : Récupère les attributs qui sont définis dans les différentes rubriques \
            encadrés par #...#
        - get_values : Définit les valeurs à partir de l'équation ou les calcule grâce aux infos \
            précisées dans <calcul>
        - replace_attributes : Remplace les attributs #...# par leur valeur
        - set_data : Construit le dict des données
        - getProblem : programme principal

    """
    # FILE_PROBLEMS = os.path.dirname(os.getcwd()) + "/avancement/problem/problems.xml"
    R_GET_ATTRIBUTES = re.compile(r'#([mncvX]{1}[tire]{1})#')
    R_ANALYSE = re.compile(r'#([mncv]{1}[tire]{1}|X)#\s?=\s?([a-zA-Z0-9\s*\/\+\-\?\!\(\,.\)#\[\]]*\d?)')
    R_REPLACE = re.compile(r'#([mnrpcXxstavzMeqli]{1,5}\d*)#')
    R_PRECISION = re.compile(r'([nmtvM][r,p]\d?)|(xmax)|(X)|(z\d?)')

    def __init__(self):
        self.lst_problems = []  # liste des problèmes
        self.level = 0
        self.objectif = None
        self.problem = None
        self.context = None
        self.question = None
        self.inconnu = None
        self.solution = ""
        self.id = None
        self.feedback = {}
        self.help = ""
        self.donnees = {}  # attributs avec valeurs
        self.precision = 3
        self.type = 0   # 1 = acide-base, 2 ou 3 = oxydo

    def get_problems(self, type: int = 1, level: int = None) -> None:
        """Récupère la liste des problèmes

        On enregistre la liste dans la structure lst_problems, on accède à un élément problème\
             par son indice

        Args:
            level (int, optional): niveau de difficulté
        """
        with open(getFilePath(FILE_PROBLEMS, os.path.abspath(os.getcwd())) + "/" + FILE_PROBLEMS, 'r') as fd:
            data = xmltodict.parse(fd.read())
            lst = data['problems']['problem']
            tab = []
            if level:
                for e in lst:
                    if int(e['level']) == level and int(e['type']) == type:
                        tab.append(e)
                self.lst_problems = tab
            else:
                self.lst_problems = lst

    def get_problem(self, indice: int = None) -> None:
        """Choisit un problème aléatoire ou identifié par son indice.

        fixe les attributs (context, question,...)
        l'indice prime sur le niveau
        Ainsi self.context contiendra le contexte en cours

        Args:
            indice (int, optional): indice du problème (default: {None})
        """
        if indice is None:
            self.id_problem = randrange(len(self.lst_problems))
            self.problem = self.lst_problems[self.id_problem]
        else:
            self.id_problem = indice
            self.problem = self.lst_problems[indice]
        for tag in self.problem:
            _tag = tag[1:] if tag[0] == '@' else tag
            val = self.problem[tag] if self.problem[tag] != None else '' 
            setattr(self, _tag, val)

    def get_attributes(self) -> None:
        """Récupère les attributs qui sont définis dans les différentes rubriques encadrés par #...#

        Remplit le tableau self.attributes
        """
        self.attributes = []
        
        for tag in ['context', 'question', 'donnees', 'help', 'objectif', 'inconnu']:
            if tag in self.problem and isinstance(self.problem[tag], str):
                form = Problem.R_ANALYSE.findall(self.problem[tag])
                for e in form:
                    if e not in self.attributes:
                        self.attributes.append(e)

        #self.inconnu.value = Problem.R_ANALYSE.findall(self.problem['inconnu']['value'])[0]


    def get_precision(self, formule: str, value: float = None) -> int:
        """Retourne le nombre de CS

        Args:
            formule (str): formule utilisée pour le calcul
            value (float, optional): valeur

        Returns:
            int: nombre de chiffres significatifs
        """
        if not isinstance(formule, str):
            formule = str(formule)

        attrs = Problem.R_PRECISION.findall(formule)
        tab = []
        for attr in attrs:
            for e in attr:
                if e:
                    if 'o' + e in self.values:
                        tab.append(self.values['o'+e]['precision'])
                    elif 's' + e in self.values:
                        tab.append(get_digits(self.values['s' + e]))
                    else:
                        tab.append(self.values[e]['precision'])
        if len(tab) > 0:
            self.precision = min(tab)
            return self.precision
        elif value:
            return get_digits(value)
        else:
            return 0

    def get_values(self):
        """Définit les valeurs à partir de l'équation ou précisées dans <calcul>

            Initialise self.values
        """
        self.values = {}

        # On parcourt chaque attribut #xxx# et on renvoie un tuple avec la \
        # valeur et la precision
        for elt in self.attributes:
            
            nom = elt[0]

            # valeur obtenu par le formulaire
            if elt[1] == '!':  
                self.values[nom] = 1
            else:
                self.values[nom] = eval(elt[1])

        # Analyse de calcul
        if 'calcul' in self.problem:
            form = Problem.R_ANALYSE.findall(self.problem['calcul'])
            for e in form:
                if e not in self.attributes:
                    t = self.replace_attributes(e[1])
                    v = eval(t)
                    # le volume vt doit être compris entre 5 et 25 mL, si ce n'est pas le cas on modifie ct en conséquence.
                    if e[0] == "vt":
                        while v > 25:
                            self.values['ct'] *= 2
                            t = self.replace_attributes(e[1])
                            v = eval(t)
                        while v < 5:
                            self.values['ct'] /= 2
                            t = self.replace_attributes(e[1])
                            v = eval(t)

                    self.values[e[0]] = v
        
        # Remplacement des valeurs dans inconnu
        if isinstance(self.inconnu['field'], list):
            for elt in self.inconnu['field']:
                elt['value'] = self.replace_attributes(elt['value'])
        else:
            self.inconnu['field']['value'] = self.replace_attributes(self.inconnu['field']['value'])
        
       
    def replace_attributes(self, text: str) -> str:
        """Remplace les attributs #...# par leur valeur

        Args:
            text (str): texte extrait du fichier problem.csv

        Returns:
            str: text modifié
        """
        attributes = Problem.R_REPLACE.findall(text)
        for elt in attributes:
            text = text.replace('#' + elt + '#', str(self.values[elt]))
        return text

    def set_data(self) -> dict:
        """Construit le dict des données

        Returns:
            dict: ensemble des données du problème
        """
        dic = {}
        context = self.replace_attributes(self.context)
        question = self.replace_attributes(self.question)
        objectif = self.replace_attributes(self.objectif)
        solution = self.replace_attributes(self.solution)
        help = self.replace_attributes(self.help)

        dic['id'] = int(self.id)
        dic['niveau'] = self.level
        dic['context'] = context.translate(context.maketrans("[]","<>"))
        dic['objectif'] = objectif.translate(objectif.maketrans("[]","<>"))
        dic['question'] = question.translate(question.maketrans("[]","<>"))
        dic['donnees'] = self.values
        dic['inconnu'] = self.inconnu
        dic['help'] = help.translate(help.maketrans("[]","<>"))
        dic['precision'] = self.precision
        dic['solution'] = solution.translate(solution.maketrans("[]","<>"))
        dic['img']=self.problem['img'] if 'img' in self.problem else 'Null'
        dic['type'] = self.type
        
        return dic

    # Programme Principal getProblem
    def getProblem(self, indice = None):
        """Programme principal

        Args:
            level (int, optional): niveau de difficulté. Defaults to None.

        Returns:
            None:
        """

        self.get_problems()
        self.get_problem(indice)
        self.get_attributes()
        self.get_values()
        return self.set_data()

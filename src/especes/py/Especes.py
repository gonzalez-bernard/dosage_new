import math
import os
import sys
import xmltodict

sys.path.append(os.getcwd())
from src.modules.utils import getFilePath, convert_case
import  src.environnement.files as cst 

FILE_ACIDEBASE = getFilePath(cst.FILE_ACIDEBASE, os.path.abspath(os.getcwd())) + "/" + cst.FILE_ACIDEBASE
FILE_AUTREDOS = getFilePath(cst.FILE_DOSAGES, os.path.abspath(os.getcwd())) + "/" + cst.FILE_DOSAGES

class Especes:

    def __init__(self):
        self.acidebases = []
        self.autredos = []

    def get_especes(self) -> list:
        """Récupère liste des especes à partir du fichier
        """
        # Ouverture et lecture du fichier acidebase
        try:
            with open(FILE_ACIDEBASE, 'r') as fd:
                data = xmltodict.parse(fd.read())
                self.acidebases = data['especes']['espece']

            with open(FILE_AUTREDOS, 'r') as fd:
                data = xmltodict.parse(fd.read())
                self.autredos = data['dosages']['dosage']
            
            return self.acidebases, self.autredos
        except OSError:
            raise OSError
        except ValueError:
            raise ValueError

    def get_type(self, type):
        """Retourne une liste avec les espèces d'un type donné

        Args:
            type (str): type acide|base

        Returns:
            list: especes du type
        """
        return list(filter(lambda d: d['type'] == type, self.acidebases))

    def get_lst_select(self, type, label = 'label'):
        """Retourne liste des éléments à insérer dans la liste déroulante
        """
        if type == 0:
            afort, pafort, pafaible, bfort, afaible, bfaible = [], [], [], [], [],[]
            for d in self.acidebases:
                if d['type'] == "0":
                    afort.append ({'id': d.get('@id'),'label' : d.get('nom') +" - "+ convert_case(d.get('formule'))})
                elif d['type'] == '1':
                    afaible.append ({'id': d.get('@id'),'label' : d.get('nom')  +" - "+ convert_case(d.get('formule'))})
                elif d['type'] == '2':
                    pafort.append ({'id': d.get('@id'),'label' : d.get('nom') +" - "+ convert_case(d.get('formule'))})
                elif d['type'] == '3':
                    pafaible.append ({'id': d.get('@id'),'label' : d.get('nom') +" - "+ convert_case(d.get('formule'))})
                elif d['type'] == '4':
                    bfort.append ({'id': d.get('@id'),'label' : d.get('nom') +" - "+ convert_case(d.get('formule'))})
                elif d['type'] == '5':
                    bfaible.append ({'id': d.get('@id'),'label' : d.get('nom') +" - "+ convert_case(d.get('formule'))})

            return [afort, afaible, pafort, pafaible, bfort, bfaible]
        else:
            aReactions = []
            for d in self.autredos:
                aReactions.append({'id': d.get(('@id')), 'label': convert_case(d.get('label'))})
            return aReactions
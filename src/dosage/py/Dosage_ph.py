import sys
import os
sys.path.append(os.getcwd())
import numpy as np
import json
from math import fabs, log10, sqrt, pow
import re
from src.dosage.py.Dosage import Dosage
from src.dosage.py.C import C
import src.modules.utils as utils 

"""STRUCTURES

    especes : List of dicts
        items : formule, nom, acide, base, [spec], [ampho], conc, pka, vol

    autres données :
        titre_conc, titre_vol_init
        titrant_conc, titrant_vol
        v_max
"""

class Dosage_pH(Dosage):

    def __init__(self, type, c1, c2, v1, ve, pK=[]):
        """Initialise la classe

        Args:
            type (int): type de réaction 0:acide/base, 1:oxydo
            c1 (Float): concentration titre
            c2 (Float): concentration titrant
            v1 (Float): volume titre
            ve (Float): volume eau
            pK (list, optional): valeurs des pKa. Defaults to [].
        """
        Dosage.__init__(self, type, c1, c2, v1, ve)
        self.pK = pK        # liste des pKa
        self.pHs = []       # liste des pHs

    # retourne le type de l'espèce
    def get_type(self, reactif):
        """Retourne le type de l'espèce 
        acides, bases fort ou faible, voir Constantes AF, Af, BF, bf
        AF : si pKa < 0, Af/Bf : si pKa compris entre 0 et 14, BF si pKa = 14
        
        Args:
            reactif (int): titre ou titrant

        Returns:
            int: 0=AF, 1=Af, 2=BF, 3=Bf 
        """
        if self.especes[reactif]['pka'][0]<0:
            return C.AF
        elif self.especes[reactif]['pka'][0] == 14:
            return C.BF
        return C.Af if self.get_type(1) == C.BF else C.Bf

    # détermine le type de dosage
    def get_typedosage(self):
        """Retourne le type de dosage
        (voir constantes AFBF, AfBF,...)

        Returns:
            int : numèro indiquant le type
        """
        if self.get_type(C.TITRANT) == C.BF:
            if self.get_type(C.TITRE) == C.AF:
                return C.TYPE_AFBF
            return C.TYPE_AfBF
        if self.get_type(C.TITRANT) == C.AF:
            if self.get_type(C.TITRE) == C.BF:
                return C.TYPE_BFAF
            return C.TYPE_BfAF

    # calcule les conductances en fonction du volume
    def main(self, titrant_vol_max, variation_volume):
        """calcule les volumes et les conductances
        On calcule d'abord les volumes en fonction du pH
        Ensuite, on utilise les données trouvées pour trouver les conductances

          Args:
            titrant_vol_max : volume maximal de titrant
            variation_volume : variation élémentaire du volume
            v (list(Float)): liste des volumes
            pH (list(Float)): liste des pH

          Returns:
            list(List): liste des volumes, pH, concentrations et conductivité
        """

        # Analyse pour déterminer le type de réaction
        self.type_reaction = self.get_typedosage()

        # Calcul des volumes en fonction du pH
        (v, pH) = self.calc_phvol(titrant_vol_max, variation_volume)

        # Calcul des concentrations
        concentrations = self.calc_concentrations(v, pH)

        # Calcul de la conductivité
        conductivites = self.calc_conductivites(concentrations)

        # enlève volume titré et réactif pour tracé du graphe
        # v = list(map(lambda x: x-(self.titre_vol_init + self.reactif_vol), self.vols))
        return (v, pH, concentrations, conductivites)

    # Calcule les différents points de la courbe de dosage
    def calc_phvol(self, v_max, dv=0.1):
        """Calcule les différents points de la courbe de dosage

        Args:
          v_max (float) : volume max
          dv (float, optional): variation élémentaire du volume. Defaults to 0.1

        Returns:
          List[List] tableau des volumes et pH
        """

        # Fonction interne de calcul
        def _calc_phvol(ph_initial, sens):
            """calcul le ph

            Args:
                ph_initial (Float): pH initial
                sens (int): indique si on dose un acide (1) ou une base (-1)

            Returns:
                list: liste des volumes
            """

            # Calcule le volume à partir des concentrations et du pH
            def _calc_volumes(ph):
                """Calcule le volume à partir des concentrations et du pH
                  Principe de calcul

                  Cas d'un dosage d'un acide fort par une base forte :
                  On a équilibre des charges h+[x+] = w+[x-] donc phi = w - h = [x+] - [x-]
                  La conservation des espèces donnent [x+] = CbVb/(Va+Vb) et [x-] = CaVa/(Va+Vb)
                  Par regroupement on obtient Vb = Va.(Ca + phi)/(Cb-phi)
                  Si on tient compte du volume d'eau Ve, on a Vb = (CaVa + phi(Va+Ve))/(Cb-phi)

                  Cas d'un dosage d'un acide faible par une base forte :
                  On a équilibre des charges h+[x+] = w+[x-] donc phi = w - h = [x+] - [x-]
                  La conservation des espèces donnent [x+] = CbVb/(Va+Vb) et [A-] + [AH] = CaVa/(Va+Vb)
                  La constante d'équilibre Ka = [A-]h/[AH] permet d'obtenir [AH] = [A-]h/Ka
                  Comme [x-] = [A-] on obtient [A-] = CaVa/(Va+Vb) - [A-]h/Ka soit [A-] = CaVa/(Va+Vb)xKa/(Ka+h)
                  On obtient phi = CbVb/(Va+Vb) - CaVa/(Va+Vb)xKa/(Ka+h)
                  Par regroupement Vb(Cb-phi) = CaVa x Ka/(Ka+h) + phi x Va 
                  et donc Vb = Va (phi + CaKa/(Ka+h))/(Cb - phi)  (#173)
                  avec de l'eau Vb = (CaKa(Va+Ve)/(Ka+h) +phi.Va)/(Cb-Phi)

                  Link : https://www.f-legrand.fr/scidoc/docimg/sciphys/chimieanalyt/dosagepolyacide/dosagepolyacide.html 

                  Args:
                    ph (float): pH

                  Returns:.
                    list (float) : volume et concentration de chaque espèce
                """

                n = len(self.pK)
                Ke = 1.0e-14
                h = 10**(-ph)
                c = np.ones(n+1)

                # acide ou base forte
                if n == 0 or self.pK[0] <= 0 or self.pK[0] >= 14:
                    phi = Ke/h - h
                    if self.type_reaction == C.TYPE_AFBF:  # dosage d'un acide
                        #v = self.titre_vol_init * (self.titre_conc+phi)/(self.titrant_conc-phi)
                        v = (self.titre_conc*self.titre_vol_init + phi*(self.titre_vol_init + self.eau_vol))/(self.titrant_conc - phi)
                        
                    else:   # dosage d'une base
                        #v = self.titre_vol_init * (self.titre_conc-phi)/(self.titrant_conc+phi)
                        v = (self.titre_conc*self.titre_vol_init - phi*(self.titre_vol_init + self.eau_vol))/(self.titrant_conc + phi)
                    return v

                # acide ou base faible
                else:
                    type = 1 if self.type_reaction == C.TYPE_AFBF or self.type_reaction == C.TYPE_AfBF else 2
                    Da = 1
                    Ka = 1
                    for p in range(1, n+1):
                        Ka *= 10**(-self.pK[p-1])
                        x = h**p/Ka if type == 1 else Ka/h**p
                        c[p] = x
                        Da += x
                    Na = n
                    Ka = 1
                    for p in range(1, n):
                        Ka *= 10**(-self.pK[p-1])
                        Na += (n-p)*h**p / Ka if type == 1 else (n-p)*Ka/(h**p)
                    phi = Ke/h-h
                    if type == 1: # acide faible
                        # v = self.titre_vol_init * (phi+Na*self.titre_conc/Da)/(self.titrant_conc-phi)
                        v = self.titre_vol_init * (phi+Na*self.titre_conc/Da + self.eau_vol*phi/self.titre_vol_init)/(self.titrant_conc-phi)
                    else:   # base faible
                        #v = self.titre_vol_init * (-phi + Na/Da*self.titre_conc) / (self.titrant_conc+phi)
                        v = self.titre_vol_init * (-phi + Na*self.titre_conc/Da - self.eau_vol*phi/self.titre_vol_init) / (self.titrant_conc+phi)

                    for p in range(n+1):
                        if self.type_reaction == C.TYPE_AFBF:
                            c[p] *= Da*self.titre_conc * \
                                self.titre_vol_init/(self.titre_vol_init+v)
                        else:
                            c[p] *= self.titre_conc*self.titre_vol_init / \
                                (self.titre_vol_init+v)/Da
                    self.conc = c
                return v

            # limite volume et pH 
            def _limit_volumes(v, ph, v_max):
                i = 0
                while i < len(v) and v[i] < 0:
                    i += 1
                i_min = i
                i = len(v) - 1
                while i > i_min and (v[i] < 0 or v[i] > v_max):
                    i -= 1
                i_max = i
                
                v = v[i_min:i_max]
                ph = ph[i_min:i_max]

                return (v, ph)

            # calcul nombre de points et initialise les tableaux
            npts = int(v_max/dv)
            dpH = 14/npts
            pH = []
            v = np.zeros(npts)
            self.pK = self.especes[0]['pka']
            self.pK.sort(reverse=True)

            ph = ph_initial
            if sens == 1:
                i = 0
                while i < npts:
                    _v = _calc_volumes(ph)
                    if i > 1 and _v > 0 and v[i-1] < 0: # pH à l'origine
                        ph -= dpH
                        for j in range(10):
                            ph += dpH/10
                            v[i] = _calc_volumes(ph)
                            pH.append(ph)
                            i +=1
                        ph += dpH/10
                    else :
                        v[i] = _v
                        pH.append(ph)
                        ph += dpH
                        i += 1
            else:
                for i in range(npts):
                    v[i] = _calc_volumes(ph)
                    pH.append(ph)
                    ph -= dpH

            # on ne conserve que les volumes >=0 et <= vmax
            (v, pH) = _limit_volumes(v, pH, v_max)
            return [v, pH]

        # lance le calcul des volumes en fonctions des pH
        if self.type_reaction == C.TYPE_AFBF or self.type_reaction == C.TYPE_AfBF:
            return _calc_phvol(0, 1)
        else:
            return _calc_phvol(14, -1)

    # Retourne la formule et la charge à partir de la formule
    def get_props(self, formule):
        """Retourne la formule et la charge à partir de la formule

        Args:
        formule str :

        Returns:
        tuple (formule, 1)

        See:
        _get_1s
        """

        # On cherche la présence de l'apostrophe
        if "'" not in formule:
            return (formule, 0)

        reg = re.compile(r'(\d?[+-])')
        charge = reg.findall(formule)
        if charge[0] == '+':
            charge = 1
        elif charge[0] == '-':
            charge = -1
        else:
            if charge[0][1] == '-':
                charge = -int(charge[0][0])
            else:
                charge = int(charge[0][0])

        return (formule, charge)

    # Enregistre les ions
    def get_ions(self):
        """Enregistre les ions

        On les extrait de data['esp1'] et data['esp2] avec les id = acide, base, spec, ou ampho.
        Il faut aussi trier entre les espèces moléculaires et les ions.
        Enfin, il faut tenir compte de la présence de H30+ et HO-

        Args:
            data (dict): liste des espèces

        Returns:
            [list(tuple)]: liste des formules et 1s [(formule,1),...]
        """

        

        ions = []
        for i in range(2):
            e = self.especes[i]
            (formule, charge) = self.get_props(e['acide'])
            if charge:
                ions.append(('acide', formule, charge))
            (formule, charge) = self.get_props(e['base'])
            if charge:
                ions.append(('base', formule, charge))
            if 'spec' in e:
                (formule, charge) = self.get_props(e['spec'])
                if charge:
                    ions.append(('spec'+str(i),formule, charge))
            if 'ampho' in e:
                (formule, charge) = self.get_props(e['ampho'])
                if charge:
                    ions.append(('ampho',formule, charge))

        if ('acide', "H_3_O'+'", 1) not in ions:
            ions.append(('h', "H_3_O'+'", 1))

        if ('base', "OH'-'", -1)not in ions and ('base', "HO'-'", -1) not in ions:
            ions.append(('w', "HO'-'", -1))

        return ions

    # Calcule les concentrations
    def calc_concentrations(self, v, pH):
        """Calcule les concentrations
        On fait l'inventaire de toutes les espèces ioniques
        Le titrant a toujours une espèce spectatrice dont la concentration = C(titrant)xV(titrant)/V(total)
        Si le titré a une espèce spectatrice sa concentration vaut C(titre)xV(titre)/V(total)
        h et w sont déduit du pH 
        A partir de là il y a 2 possibilités :
        - soit il reste une espèce qu'on déduit par différence, [x] = w - h + [s-] - s[+]
            si [x] < 0 , on inverse
        - soit il reste 2 espèces inconnues, car il y a une espèce ampho. Dans ce cas [x1] + [x2] = h - w + [s+] = phi
        et Ka = h[x2]/[x1] on en déduit que [x2] = phi/(1 + h/Ka) et [x1] = phi - [x2] ! Ka correspond à la deuxième acidité 

        Args:
          v (Float): liste des volumes
          pH (Float): liste des pH

        Returns:
          concentrations: liste des concentrations
        """

        def _get_spectateur(espece, ions):
            if espece == C.C_TITRANT:
                spec, conc, e1, e2 = 'spec1', self.titrant_conc, 'base', 'acide'  
            else:
                spec, conc, e1, e2 = 'spec0', self.titre_conc, 'acide', 'base'

            formule_ion = self.especes[espece]['spec']
            indice_ion = utils.get_ListTuple_forValue(ions, spec)[0]
            ion_spec = (formule_ion, ions[indice_ion][2])
            # calcule la quantité de matière en tenant compte des charges entre l'ion spectateur et l'espece active
            if self.type_reaction == C.TYPE_AFBF or self.type_reaction == C.TYPE_AfBF:
                charge_ion = self.get_props(self.especes[espece][e1])[C.CHARGE]
            else:
                charge_ion = self.get_props(self.especes[espece][e2])[C.CHARGE]
            rapport_charge = utils.get_sign(charge_ion)*charge_ion/ion_spec[1]
            spec_conc = conc*rapport_charge
            ions[indice_ion] = ions[indice_ion] + (spec_conc,)

        def _get_concentrations(pH, v, indice_titrant, indice_titre, ions):
            # calcul de h et w
            h = pow(10, -pH)
            w = 1e-14/h
            t = [{'f': "H_3_O'+'", 'c': h}]
            t.append({'f': "HO'-'", 'c': w})

            # calcul de la concentration du spectateur titrant (spec1)
            s1 = 0
            if indice_titrant:
                s1 = ions[indice_titrant][3]*v/(v+self.titre_vol_init)
                t.append({'f': ions[indice_titrant][1], 'c': abs(s1)})

            # calcul de la concentration du spectateur titre s'il existe (spec0)
            s0 = 0
            if indice_titre:
                s0 = ions[indice_titre][3]*self.titre_vol_init/(v+self.titre_vol_init)
                t.append({'f': ions[indice_titre][1], 'c': abs(s0)})

            return (t, h, w, s0, s1)

        concentrations = []

        # On récupère les conductivités
        if len(self.conductivites) == 0:
            self.conductivites = self.get_file_conductivites()

        # récupère les ions identifié par <acide>, <base>, <spec>, <ampho>
        ions = self.get_ions()
        
        # recherche ions titrant spectateur formule(0) et charge(1)
        if 'spec' in self.especes[C.C_TITRANT]:
            _get_spectateur(C.C_TITRANT, ions)

        # recherche ions titre spectateur formule(0) et charge(1)
        if 'spec' in self.especes[C.C_TITRE]:
            _get_spectateur(C.C_TITRE, ions)

        # analyse des ions et recherche des ions inconnus
        inconnus = []
        for e in ions:
            if e[0] not in ["spec0","spec1"] and e[1] not in ["H_3_O'+'","OH'-'","HO'-'"]:
                inconnus.append(e)
        
        try:
            indice_titrant = utils.get_ListTuple_forValue(ions, 'spec1')[0]
        except Exception as e:
            indice_titrant = None

        try:
            indice_titre = utils.get_ListTuple_forValue(ions, 'spec0')[0]
        except Exception as e:
            indice_titre = None

        if len(inconnus) == 0:
            # calcul des concentrations

            for i in range(len(v)):
                t, h, w, s0, s1 = _get_concentrations(pH[i], v[i], indice_titrant, indice_titre, ions)
                concentrations.append(t)

        elif len(inconnus) == 1:  # un seul ion est inconnu      
           
            # calcul des concentrations
            for i in range(len(v)):
                t, h, w, s0, s1 = _get_concentrations(pH[i], v[i],indice_titrant, indice_titre, ions)
                x = -(h - w + s0 + s1)/inconnus[0][2] 
                t.append({'f': inconnus[0][1], 'c': abs(x)})
                concentrations.append(t)

        else:
            # recherche des 2 ions inconnus. Ils sont reliés par le Ka.
            # il faut déterminer l'ordre des espèces. 
            # Pour un dosage AfBF c'est soit ampho/base (cas de H2SO4),soit acide/base (cas de HPO42-)
            K = pow(10, -self.pK[0])

            # détermination des ions. indices contient les 2 ions inconnus, dans l'ordre suivant
            # l'ion le plus acide est le premier (sa charge est plus grande)
            x = (0,1) if inconnus[0][2] > inconnus[1][2] else (1,0)
            
            # charges
            c = [inconnus[x[0]][2], inconnus[x[1]][2]]

            for i in range(len(v)):
                t, h, w, s0, s1 = _get_concentrations(pH[i], v[i],indice_titrant, indice_titre,ions)
                a = h - w + s0 + s1
                x1 = abs(a/(c[0] + c[1]*K/h))
                x2 = x1*K/h
                t.append({'f': inconnus[x[0]][1], 'c': x1})
                t.append({'f': inconnus[x[1]][1], 'c': x2})
                concentrations.append(t)

        return concentrations

    # Calcule la conductivité
    def calc_conductivites(self, concentrations):
        """Calcule la conductivité de la solution

        Args:
            concentrations (list): liste des concentrations 

        Returns:
            [list]: liste des conductivités
        """
        conductivites = np.zeros(len(concentrations))
        i = 0
    
        for etat in concentrations:
            cd = 0   # variable pour conductivité
            for ions in etat:
                # recherche index de l'ion dans liste des conductivités molaires
                idx = utils.get_ListDict_forPropValue(self.conductivites, 'f', ions['f'])[0]
                # On multiplie la conductivité molaire trouvée par la concentration
                cd = cd + self.conductivites[idx]['cd']*ions['c']
            conductivites[i] = cd
            i = i + 1
        return conductivites

    '''
    # calcule le ph_min et ph_max
    def calc_ph_extremum(self, v_max):
        # calcul du pHmax et pH min
        # Plusieurs cas :
        # si monoacide (un seul pKa)
        #   si pKa < 0 : acide fort x = 0 pH = -log Ca , x >> 0 pH = 14 + log((CbVb - CaVa)/Va+Vb)
        #   si pKa > 0 : acide faible x = 0 pH = 1/2.log(pKa - log Ca), x >>0 pH = 14 + log ((CbVb-CaVa)/Va+Vb)
        # si monobase
        #   si pKa > 14 : base forte x = 0 pH = 14 + log (Cb), x>>0 pH = -log((CaVa-CbVb)/va+Vb)
        #   si pKa < 7  : base faible
        # si polyacide (plusieurs pKa)
        #   si pKa[0] < 0 : x = 0 pH = -log(0.5 *(Ca-Ka + sqrt(8KaCa)), x>>0

        # AF/BF : x = 0 pH = -log Ca ! attention à la charge (diacide), x >> 0 pH = 14 + log((CbVb - CaVa)/Va+Vb)
        # Af/BF : x = 0 pH = 1/2.log(pKa - log Ca), x >>0 pH = 14 + log ((CbVb-CaVa)/Va+Vb)
        # BF/AF : x = 0 pH = 14 + log (Cb), x>>0 pH = -log((CaVa-CbVb)/va+Vb)

        if self.type_reaction == C.TYPE_AFBF:
            # la charge est égale au nombre de pKa
            ph_min = -log10(self.titre_conc*len(self.pK))
            ph_max = 14+log10((abs(v_max*self.titrant_conc-self.titre_conc *
                              self.titre_vol_init))/(v_max+self.titre_vol_init))
        elif self.type_reaction == C.TYPE_AfBF:
            ph_min = 0.5 * (self.pK[0] - log10(self.titre_conc))
            ph_max = 14+log10((abs(v_max*self.titrant_conc-self.titre_conc *
                              self.titre_vol_init))/(v_max+self.titre_vol_init))
        elif self.type_reaction == C.TYPE_BFAF:
            ph_min = 14 + log10(self.titrant_conc)
            ph_max = -log10((abs(v_max*self.titrant_conc-self.titre_conc *
                            self.titre_vol_init))/(v_max+self.titre_vol_init))

        return (ph_min, ph_max)
    '''
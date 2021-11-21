class C(object):
  # indice des espèces dans tableau concentration (concs)
  E_TITRE = 0
  E_TITRANT = 1
  E_EXC = 2     # soit H3O+, soit H20
  E_REACTIF = 3
  E_PTITRE = 4
  E_PTITRANT = 5
  E_PEXC = 6    # soit H20, soit HO-
  E_PREACTIF = 7
  E_STITRE = 8
  E_STITRANT = 9
  E_SEXC = 10
  E_SREACTIF = 11
  E_H = 12
  E_OH = 13
  

  # indice pour ions dans calcul concentration
  FORMULE = 0
  CHARGE = 1
  
  # indice des espèces dans tableau réactifs
  TITRE = 0
  TITRANT = 1
  EXC = 2
  REACTIF = 3
  
  # indices dans tableau coeffs
  # ordre des indices :
  # - 0 -> type = 0 une réaction ,
  # - 1 -> type = 1 dosage retour (on dose le réactif restant) ou indirect (on dose le produit réactif)  première équation,
  # - 2 -> type = 2 dosage retour seconde équation
  # - 3 -> type = 3 dosage indirect seconde équation
  
  C_TITRE = 0
  C_TITRANT = 1
  C_EXC = 2 # 2 
  C_PTITRE = 3 # ou 3 avec offset
  C_PTITRANT = 4 # ou 4
  C_REACTIF_0 = 5   # équation N°1
  C_REACTIF_1 = 6 # équation N°2 (type retour ou excès)
  C_PREACTIF_0 = 7 # équation N°1
  C_PREACTIF_1 = 8 # équation N°2 (retour ou excès)

  C_H = 9
  C_OH = 10
  
  REAC = 0
  PROD = 1
  SPEC = 2

  PROD_TITRE = 4
  PROD_TITRANT = 5
  PROD_REACTIF = 6
  SPEC_TITRE = 7
  SPEC_TITRANT = 8
  SPEC_EXC = 9
  SPEC_REACTIF = 10

  # Type des réactions 
  TYPE_AFBF = 0   # acide fort / base forte
  TYPE_AfBF = 1   # acide faible / base forte
  TYPE_BFAF = 2   # base forte / acide fort
  TYPE_BfAF = 3   # base faible / acide fort
  TYPE_SIMPLE = 1
  TYPE_RETOUR = 2
  TYPE_EXCES = 3

  # type de l'espèce  
  AF = 0  # acide fort
  Af = 1  # acide faible
  BF = 2  # base forte
  Bf = 3  # base faible
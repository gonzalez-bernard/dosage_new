/** DOSAGE - lang_fr.js */

const DO_TITLE = "Dosage"
const DO_MSG = "Cette simulation permet de doser une espèce chimique présente dans le bécher par une \
autre espèce dans la burette."

const DO_FLACON = "Clic pour sélectionner et déplacer \n" +
"Double clic pour pencher ou retourner \nClic pour vidanger quand le flacon est penché"

const DO_FLACON_ERR = "Un indicateur a déjà été versé !\nRelancer un nouveau dosage si vous voulez \nen choisir un autre."

const DO_PHMETRE = "Double clic pour mesurer le pH \nou pour remettre le pHmètre en place.</br>\n"+
"Clic sur la burette ou touche 'V' pour verser."

const DO_CONDUCTIMETRE = "Double clic pour mesurer la conductivité \nou pour remettre le conductimètre en place."

const DO_POTENTIOMETRE = "Double clic pour mesurer la tension \nou pour remettre le conductimètre en place."

const DO_BT_TAN1 = "Cliquer sur un point de la courbe, avant l'équivalence, pour placer une tangente.\n" +
"Ne pas prendre les points des extrémités !"

const DO_BT_TAN2 = "Cliquer sur un point de la courbe après l'équivalence pour placer la seconde tangente. \nIl est possible de la déplacer pour la rendre parallèle à la première."

const DO_BT_DERIVEE = "La courbe dérivée dpH/dV permet de trouver le volume et le pH à l'équivalence."

const DO_BT_PERP = "Affiche la perpendiculaire déplaçable aux deux tangentes tracées.\n Le point d'intersection avec la courbe donne le pH \net le volume à l'équivalence."

const DO_BT_COTH = "Affiche la courbe théorique."

const ERR_DOSAGE = "<p>Le dosage est impossible.</p>" +
"<p>La cause d'erreur est certainement dûe à une valeur mal choisie.</p><p> Il est possible, par exemple, que la quantité de matière initiale de réactif ou de titrant soit insuffisante pour consommer toute la quantité de l'espèce à titrer.</p>" +
"<p>Il faut modifier les valeurs dans le formulaire de saisie.</p>"

const DO_BT_RESET = "On recommence le dosage avec les conditions initiales."

const DOS_BT_NEW_DOSAGE = "On recommence le dosage en choisissant d\'autres espèces et/ou concentrations."

const DOS_BT_INFO = "Affiche des informations sur le dosage."

const DOS_NEW_DOSAGE = "Nouveau dosage"

const DO_RESET = "RESET"
const DO_INFO = "INFO"
const DOS_SAVE_GRAPH = "Enregistrer Graphe"
const DOS_DSP_LST_GRAPH = "Liste des graphes"
const DOS_TOOLTIP_OEIL = "Affiche ou <br/>cache la courbe"
const DOS_TOOLTIP_TRASH = "Supprime <br/>la courbe"



export {DO_MSG, DO_TITLE, DO_FLACON, DO_PHMETRE, DO_CONDUCTIMETRE, DO_POTENTIOMETRE, DO_BT_TAN1, DO_BT_TAN2, DO_BT_DERIVEE, DO_BT_COTH, ERR_DOSAGE, DO_BT_PERP, DO_BT_RESET, DOS_BT_NEW_DOSAGE, DOS_BT_INFO,DOS_NEW_DOSAGE, DO_INFO, DO_RESET, DO_FLACON_ERR, DOS_SAVE_GRAPH, DOS_DSP_LST_GRAPH, DOS_TOOLTIP_OEIL, DOS_TOOLTIP_TRASH}
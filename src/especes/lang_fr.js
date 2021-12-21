/** ESPECES - lang_fr.js */

const ES_TITLE = "Espèces"
const ES_INTRO = "Dans cet onglet, vous devez choisir le type de réaction (acido-basique ou oxydo-réduction)," +
    "les espèces et les quantités."

const ES_TYPE = " Type de réaction "
const ES_AB = "Acido-basique"
const ES_OR = "Autres (Oxydo-réduction, Complexation)"

const ES_ACIDEBASE_TITRE = "Espèces"
const ES_TITRE = "Espèce à titrer *"
const ES_TITRANTE = "Espèce titrante *"
const ES_ACIDEBASE_OBJECTIF = "Sélectionnez l'espèce à titrer (concentration inconnue) et l'espèce titrante (connue) "
const ES_AUTREDOS_OBJECTIF = "Sélectionnez la réaction de dosage."
const ES_AUTREDOS_TITRE = "Réaction"
const ES_SUPP = "Espèce :"
const ES_SUPP_CONC = "Concentration (mol/L) :"
const ES_EXC_VOL = "Volume (mL) :"
const ES_SUPP_VOL = "Volume (mL) :"
const ES_ESP_SUPP = " Espèce supplémentaire nécessaire au dosage "
const ES_EXC_TITRE = " Ajout d'acide ou de base "
const ES_EXC_INFO = "La quantité d'acide ou de base doit être adaptée à la quantité de matière de l'espèce titrée.<br\>" +
    "Il est indispensable qu'elle soit suffisante pour que la réaction soit complète."
const ES_EXC_CONC = "Concentration en espèce ajoutée (H_3_O'+' ou HO'-') : "
const ES_EXC_PH = "pH initial de la solution = "

const ES_BT_VALID = "Valider"
const ES_BT_INFO = "Info"
const ES_BTCLOSE_LABEL = "Quitter"
const ES_ACIDE = "Acide"
const ES_BASE = "Base"
const ES_OX = "Oxydant"
const ES_RD = "Réducteur"
const ES_CONC_TITRE = "Concentration molaire du titré (mol/L)* : "
const ES_CONC_TITRANT = "Concentration molaire du titrant (mol/L)* : "
const ES_VOL_TITRE = "Volume de l'espèce titrée (mL)* : "
const ES_INFO = "La quantité de matière de cette espèce doit être supérieure à celle de l'espèce à titrer."

const ES_LABEL_SELECT = "Sélectionner une espèce ou une réaction"
const ES_LABEL_AF = "MonoAcides forts"
const ES_LABEL_PAF = "PolyAcides forts"
const ES_LABEL_BF = "MonoBases fortes"
const ES_LABEL_Bf = "MonoBases faibles"
const ES_LABEL_Af = "MonoAcides faibles"
const ES_LABEL_PAf = "PolyAcides faibles"
const ES_LABEL_REACTION = "Réaction"

const ES_MSG_TITRE_SELECT = "Indiquez l'espèce à titrer !"
const ES_MSG_TITRANT_SELECT = "Indiquez l'espèce titrante !"
const ES_MSG_INTERVAL = "Valeur comprise entre "
const ES_MSG_HORS_INTERVAL = " hors intervalle !"
const ES_MSG_VOLUME = "Valeur comprise entre 10 mL et 20 mL"
const ES_MSG_VOLUME_SUPP = "Valeur comprise entre 1 et 10 mL"
const ES_MSG_REACTION_SELECT = "Indiquez une réaction !"
const ES_MSG_INFO_ERR = "Erreur de dosage"
const ES_MSG_DOSAGE_ERR = "<p><b>Une erreur de dosage est survenue.</b></p><p>Le dosage n'a pas été possible car un des paramètres doit être incorrect. Cette situation peut se produire si l'équivalence est atteinte pour un volume de titrant trop grand ou si un des réactifs nécessaires au dosage n'est pas en quantité suffisante.</p><p>Veuillez vérifier et modifier les valeurs incorrectes.</p>"
const ES_EAU_VOL = "Volume d'eau à ajouter (mL)* :"
const ES_VALID_SELECT = ""
const ES_MSG_INT = "Valeur entière uniquement"
const ES_MSG_ERROR_GET = "<p>Impossible de récupérer les espèces !</p><p>Une erreur inconnue est survenu.</p>"
const ES_ERROR_TITLE = "Récupération des espèces"

export {
    ES_MSG_INFO_ERR, ES_INTRO, ES_BT_VALID, ES_AB, ES_ACIDE, ES_OX, ES_BASE, ES_CONC_TITRE, ES_CONC_TITRANT, ES_OR, ES_RD, ES_TITLE, ES_TYPE, ES_ACIDEBASE_TITRE, ES_VOL_TITRE, ES_TITRE, ES_TITRANTE, ES_ACIDEBASE_OBJECTIF, ES_LABEL_AF, ES_LABEL_SELECT, ES_LABEL_BF, ES_MSG_TITRE_SELECT, ES_MSG_TITRANT_SELECT, ES_MSG_INTERVAL, ES_MSG_VOLUME, ES_AUTREDOS_OBJECTIF, ES_AUTREDOS_TITRE, ES_LABEL_REACTION, ES_SUPP, ES_SUPP_CONC, ES_SUPP_VOL, ES_ESP_SUPP, ES_INFO, ES_MSG_REACTION_SELECT, ES_MSG_VOLUME_SUPP, ES_EXC_CONC, ES_EXC_VOL, ES_EXC_INFO, ES_EXC_TITRE, ES_LABEL_PAF, ES_LABEL_PAf, ES_LABEL_Af, ES_LABEL_Bf, ES_BT_INFO, ES_BTCLOSE_LABEL, ES_EXC_PH, ES_EAU_VOL, ES_VALID_SELECT, ES_MSG_INT, ES_MSG_HORS_INTERVAL, ES_MSG_ERROR_GET, ES_ERROR_TITLE, ES_MSG_DOSAGE_ERR
}
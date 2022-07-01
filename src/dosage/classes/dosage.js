// Variable pour enregistrer toutes les informations d'un dosage

import { isNumeric, isString } from "../../modules/utils/type.js";
import * as E from "../../modules/utils/errors.js"
import { ETATS_DOSAGE, ETATS_DOSAGE_INIT } from "../../environnement/constantes.js";
import { copyDeep } from "../../modules/utils/object.js";

/** 
*  @typedef {import("../../../types/types.js").tEquation} tEquation
*  @typedef {import("../../../types/types.js").tInconnu} tInconnu
*  @typedef {import("../../../types/types.js").tReactif} tReactif
*/
class Dosage {

    constructor() {

        this.colProduit = { // contient currentColor et endColor couleurs en cours et finale
            currentColor: "",
            endColor: "",
            finale: ""
        }
        this.concs = [] // valeur des concentrations
        this.cond = 0 // conductance
        this.conds = [] // valeurs des conductances

        this.dpHs = [] // dérivée du pH

        // paramètres eau
        this.eau = {
            vol: 0,
            conc: 0,
            type: 0,
            indics: "",
            color: ""
        }

        /** @type {tEquation} */
        this.equation = { // indice de l'équation si type = TYPE_OXYDO
            id: -1,
            params: []
        }
        this.etat = copyDeep(ETATS_DOSAGE)
        this.event = 0

        // espèce excipient (H+)
        this.exc = {
            vol: 0,
            conc: 0,
            type: 0,
            indics: "",
            color: ""
        }
        this.hasReactif = false // indique s'il y a un réactif
        this.hasExc = null // indique la présence d'un excipient

        /** @type {tInconnu}  */
        this.inconnu = {
            field: []
        } // contient les informations concernant les problèmes

        this.indic = null // indicateur coloré
        this.indics = [] // indicateurs

        this.label = ""

        // indique le type de mesure possible en fonction des espèces choisies pH(1), conductimètre (2), potentiomètre (4). Les valeurs se cumulent ex : pH et potentiomètre => 3
        this.mesure = 0

        // espèce supplémentaire pour dosage retour
        this.reactif = {
            conc: 0,
            vol: 0,
            type: 0,
            indics: "",
            color: ""
        }

        this.ph = 0 // pH courant
        this.pHs = [] // valeurs de pH
        this.pot = 0 // tension potentiomètrique
        this.pots = [] // valeurs des potentiels
        this.scond = "" // texte conductance
        this.sph = "----" // pH courant formaté
        this.spot = "" // texte potentiel

        // solution
        this.solution = {
            vol: 0,
            conc: 0,
            type: 0,
            indics: "",
            color: ""
        }
        this.title = ""

        /** @type {tReactif} */
        // structure précisant l'espèce titrante
        this.titrant = {
            type: 0,
            vol: 0,
            conc: 0,
            indics: "",
            color: ""
        }

        /** @type {tReactif} */
        // structure précisant l'espèce titrée
        this.titre = {
            type: 0,
            vol: 0,
            conc: 0,
            indics: "",
            color: ""
        }

        /** @type {number} */
        this.type = 0 // type de dosage (1 = ph, 2 = cd, 3 = pt)
        this.typeDetail = undefined

        this.vols = []  // volumes ajoutés
        this.number = 0 // premier dosage
        this.id = ''    // id du dosage construit avec le type (ph, pt, cd) suivi du numéro du dosage
    }


    /** Définit une valeur pour une propriété
     * 
     * @param {string} name nom de la propriété
     * @param {any} value valeur
     */
    set(name, value) {
        if (!isString(name)) E.debugError(E.ERROR_STR)
        if (!(name in this)) E.debugError(E.ERROR_ELT)

        this.name = value
    }

    /** Retourne valeur de la propriété
     * 
     * @param {string} name nom propriété
     * @returns {any} valeur
     */
    get(name) {
        if (!isString(name)) E.debugError(E.ERROR_STR)
        if (!(name in this)) E.debugError(E.ERROR_ELT)
        return this[name]
    }

    /** Test si valeur est inclus dans etat ou event
     * 
     * @param {string} name nom
     * @returns {number}    */
    getState(name) {
        if (!isString(name)) E.debugError(E.ERROR_STR)
        return this.etat[name]
    }

    /** Retourne le résultat du ET entre this.name et value
     * 
     * @param {string} name nom propriété
     * @param {number} value valeur
     * @returns {number} résultat du masque entre this.name et value
     */
    getMask(name, value) {
        if (!isString(name)) E.debugError(E.ERROR_STR)
        if (!isNumeric(value)) E.debugError(E.ERROR_NUM)
        return this.get(name) & value
    }

    /** Définit l'ID du dosage
     * 
     */
    setID() {
        const types = ["ph", "cd", "pt"]
        this.id = types[this.type - 1] + this.number
    }

    /** Modifie la variable "etat"
     * 
     * @param {string} name valeur de l'état défini dans etats.js
     * @param {number} value précise la valeur si -1=inverse
     * @param {number| undefined} prm
     */
    setState(name, value, prm = undefined) {
        if (!isNumeric(value)) E.debugError(E.ERROR_NUM)
        if (!isString(name)) E.debugError(E.ERROR_STR)

        if (value == -1) {
            if (prm) {
                this.etat[name] = this.etat[name] == 0 ? prm : 0
            } else {
                this.etat[name] = 1 - this.etat[name]
            }
        } else {
            this.etat[name] = value
        }
    }

    /** Réinitialise les états pour un nouveau dosage
    * - ne modifie pas LAB_INIT, DOSAGE_INIT, GRAPH_INIT, GRAPHMENU_INIT
    */
    resetState() {
        ETATS_DOSAGE_INIT.forEach((e) => {
            this.setState(e, 0)
        })
    }

}

var gDosageListenUpdate = (data, o) => {
    const vars = ['APPAREIL_TYPE', 'DOSAGE_ON', 'ESPECES_INIT']
    if (vars.indexOf(data.property) != -1) {
        if (E.DEBUG == E.ERROR_L2)
            console.error(data)
        else if (E.DEBUG == E.ERROR_L3)
            console.log(data)
    }
    /*
    switch (data.property){
        case 'APPAREIL_TYPE':
            console.log(data)
            break;
    }*/
}

export { Dosage, gDosageListenUpdate }
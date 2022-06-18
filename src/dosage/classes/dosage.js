// Variable pour enregistrer toutes les informations d'un dosage

import { isNumeric, isString } from "../../modules/utils/type.js";
import * as e from "../../modules/utils/errors.js"
import { etats } from "../../environnement/constantes.js";
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
        this.etat = copyDeep(etats)
        this.event = 0
        this.exc = { // espèce excipient (H+)
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

        this.reactif = { // espèce supplémentaire pour dosage retour
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

        this.solution = { // solution
            vol: 0,
            conc: 0,
            type: 0,
            indics: "",
            color: ""
        }
        this.title = ""

        /** @type {tReactif} */
        this.titrant = { // structure précisant l'espèce titrante
            type: 0,
            vol: 0,
            conc: 0,
            indics: "",
            color: ""
        }

        /** @type {tReactif} */
        this.titre = { // structure précisant l'espèce titrée
            type: 0,
            vol: 0,
            conc: 0,
            indics: "",
            color: ""
        }

        /** @type {number} */
        this.type = 0 // type de dosage
        this.typeDetail = undefined

        this.vols = [] // volumes ajoutés
        this.id = 0     // premier dosage
    }


    /** Définit une valeur pour une propriété
     * 
     * @param {string} name nom de la propriété
     * @param {any} value valeur
     */
    set(name, value) {
        if (!isString(name)) throw new TypeError(e.ERROR_STR)
        if (!(name in this)) throw new TypeError(e.ERROR_ELT)

        this.name = value
    }

    /** Retourne valeur de la propriété
     * 
     * @param {string} name nom propriété
     * @returns {any} valeur
     */
    get(name) {
        if (!isString(name)) throw new TypeError(e.ERROR_STR)
        if (!(name in this)) throw new TypeError(e.ERROR_ELT)
        return this[name]
    }

    /** Test si valeur est inclus dans etat ou event
     * 
     * @param {string} name nom
     * @returns {number}    */
    getState(name) {
        if (!isString(name)) throw new TypeError(e.ERROR_STR)
        return this.etat[name]
    }

    /** Retourne le résultat du ET entre this.name et value
     * 
     * @param {string} name nom propriété
     * @param {number} value valeur
     * @returns {number} résultat du masque entre this.name et value
     */
    getMask(name, value) {
        if (!isString(name)) throw new TypeError(e.ERROR_STR)
        if (!isNumeric(value)) throw new TypeError(e.ERROR_NUM)
        return this.get(name) & value
    }

    /** Modifie la variable "etat"
     * 
     * @param {string} name valeur de l'état défini dans etats.js
     * @param {number} value précise la valeur si -1=inverse
     * @param {number| undefined} prm
     */
    setState(name, value, prm = undefined) {
        if (!isNumeric(value)) throw new TypeError(e.ERROR_NUM)
        if (!isString(name)) throw new TypeError(e.ERROR_STR)

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
}

export { Dosage }
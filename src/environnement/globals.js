import { isNumeric, isString } from "../modules/utils/type.js";
import * as e from "../modules/utils/errors.js"
import { ETAT_INITIAL } from "./constantes.js";

/**
 * @class Dosage
 * @property {tReactif} titre
*/
// Variable pour enregistrer toutes les informations du programme
class Dosage{

    
    constructor(){
        this.type = null // type de dosage
        this.equation = { // indice de l'équation si type = TYPE_OXYDO
            id: undefined,
            params: []
        } 
        this.titre = { // structure précisant l'espèce titrée
            vol: 0,
            conc: 0
        } 
        this.titrant = { // structure précisant l'espèce titrante
            vol: 0,
            conc: 0
        } 
        this.solution = { // solution
            vol: 0,
            conc: 0
        } 
        this.colProduit = {    // contient currentColor et endColor couleurs en cours et finale
            currentColor: undefined,
            endColor: undefined,
            finale: undefined
        } 
        this.etat = ETAT_INITIAL
        this.event = 0
        this.ph = undefined // pH courant
        this.sph = "----" // pH courant formaté
        this.cond = 0 // conductance
        this.scond = "" // texte conductance
        this.pot = 0 // tension potentiomètrique
        this.spot = "" // texte potentiel
        this.indic = null // indicateur coloré
        this.lst_acide = [] // liste des espèces acido-basique
        this.lst_oxydo = [] // liste des espèces oxydo
        this.lst_equation = [] // liste des équations
        this.listAcideBase = [] // liste des couples
        this.listOxydo = [] // liste des réactions
        this.eqs = []
        this.pHs = [] // valeurs de pH
        this.vols = [] // volumes ajoutés
        this.dpHs = [] // dérivée du pH
        this.pots = [] // valeurs des potentiels
        this.conds = [] // valeurs des conductances
        this.concs = [] // valeur des concentrations
        this.reactif = { // espèce supplémentaire pour dosage retour
            conc: 0,
            vol:0
        } 
        this.exc = {    // espèce excipient (H+)
            vol: 0,
            conc: 0
        } 
        this.eau = {
            vol: 0,
            conc: 0
        }
        this.mesure = 0   // indique le type de mesure possible 1 : pH, 2 : conductimètre, 4 : potentiomètre 
        this.inconnu = {} // contient les informations concernant les problèmes
        this.charts = {
            chartPH: undefined, // enregistre une instrance de graph_ph ou graph_cd
            chartCD: undefined,
            chartPT: undefined,
            current: undefined,
        }
        this.title = ""
        this.typeDetail = undefined
        this.indics = [] // indicateurs
        this.hasReactif = false // indique s'il y a un réactif
        this.hasExc = null     // indique la présence d'un excipient
        this.label = ""
        this.inconnu = undefined
    }


    /** Définit une valeur pour une propriété
     * 
     * @param {string} name nom de la propriété
     * @param {any} value valeur
     */
    set(name, value) {
        if (!isString(name)) throw new TypeError(e.ERROR_STR)
        if (! (name in this)) throw new TypeError(e.ERROR_ELT)
        
        this[name] = value
    }

    /** Retourne valeur de la propriété
     * 
     * @param {string} name nom propriété
     * @returns {any} valeur
     */
    get(name) {
        if (!isString(name)) throw new TypeError(e.ERROR_STR)
        if (!( name in this)) throw new TypeError(e.ERROR_ELT)
        return this[name]
    }

    /** Test si valeur est inclus dans etat ou event
     * 
     * @param {string} name nom propriété
     * @param {number} value valeur
     * @returns {boolean} vrai si value est contenu dans la valeur de la propriété
     */
    test(name,value){
        if (!isString(name)) throw new TypeError(e.ERROR_STR)
        if (!isNumeric(value)) throw new TypeError(e.ERROR_NUM)
        return ((this[name] & value) == value)
    }

    /** Modifie la variable "etat"
     * 
     * @param {number} name valeur de l'état défini dans constantes.js
     * @param {number} action précise l'action 1=active, 0=désactive, -1=inverse
     */
    setState(name, action){
        if (!isNumeric(name) || !isNumeric(action)) throw new TypeError(e.ERROR_STR)
        if (action != 0 && action != 1 && action != -1) throw new TypeError(e.ERROR_RANGE)

        switch (action){
            case 1: // activation
                this.etat |= name
                break
            case 0: // désactivation
                this.etat = this.etat & ~name
                break
            case -1:
                this.etat ^= name
                break
    }
    }

    /** Enregistre les listes dans la variable globale G
     * 
     * @param {*} data données
     * @file global.js
     */
    initLists(data){
        this.lst_acide = data.list_acidebase
        this.listAcideBase = data.acidebases
        this.listOxydo = data.autredos
        this.eqs = data.eqs
    }
}

// définition d'une instance de Dosage
var G = new Dosage()

/** Retourne la variable Dosage globale
 * 
 * @returns {Dosage} G
 */
function getGlobal(){
    return G
}

export {Dosage, G, getGlobal}
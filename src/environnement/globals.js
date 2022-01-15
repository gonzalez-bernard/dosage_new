import { isNumeric, isString } from "../modules/utils/type.js";
import * as e from "../modules/utils/errors.js"
import { cts } from "./constantes.js";
import { DOS_BT_DSP_GRAPH, DOS_CHART } from "../dosage/ui/html_cts.js";
import { DOS_DSP_LST_GRAPH } from "../dosage/ui/lang_fr.js";
import { Graphx } from "../dosage/graphx.js";
import {getCircularReplacer} from "../modules/utils/object.js"

 

/**
 * @class Dosage
 * 
 * @typedef {import('../../types/types').tReactif} tReactif
 * @typedef {import("../../types/types").tGraphID} tGraphID
 */


class Dosages {

    constructor() {
        this.saveGraphs = false
        this.currentDosage = 0,   // indice du dosage courant

            /** @type Dosage[] */
            this.items = []           // tableau des dosages
    }

    /** Retourne la variable Dosage globale
     * 
     * @returns {Dosage} G
     */
    getCurrentDosage() {
        return this.items[this.currentDosage]
    }
}
    
/**
 * @class Especes
 * @description enregistre les listes des espèces
 */
class Especes {

    constructor  (){
        this.lstOxydo = [] // liste des espèces oxydo
        
        this.lstAcide = [] // liste des espèces acido-basique
        this.lstEquation = [] // liste des équations
        this.listAcideBase = [] // liste des couples
        this.listOxydo = [] // liste des réactions
        this.eqs = []
    }

    /** Enregistre les listes dans la variable globale E
     * 
     * @param {*} data données
     * @file global.js
     */
    initLists( data ) {
        this.lstAcide = data.list_acidebase
        this.listAcideBase = data.acidebases
        this.listOxydo = data.autredos
        this.eqs = data.eqs
    }
}

const gGraphMenu = {
    label: DOS_DSP_LST_GRAPH,
    idButton:  DOS_BT_DSP_GRAPH,
    idMenu: "menu",
    width: "300px",
    imgVisible: '../static/resources/img/oeil_ouvert.png',
    imgNoVisible: '../static/resources/img/oeil_ferme.png',
    imgTrash: '../static/resources/img/poubelle.png',
    menu: {},    // menu déroulant
    dialog: {}  // dialog
}


/**
 * @classdesc Cette classe permer de préciser la courbe active ainsi que les paramètres et valeurs des courbes enregistrées.
 * Les courbes sont mémorisées dans le tableau 'charts'
 */
class Graphs{

    constructor(canvas){
        
        /** @type {string[]} liste des ID des courbes enregistrées */
        this.lstID = []
        
        /** tableau de structure (tGraphID) enregistrement des courbes 
         * {id: string, chart: tDataset, visible: boolean, save: boolean, numDosage: number}
        */
        this.charts = []
        
        /** @type {string} ID de la courbe active  */
        this.activeChart = ""

        /** @type {Graphx} en cours */
        this.currentGraph = new Graphx(canvas)

    }

    /** Calcule et retourne un ID de courbe
     * 
     * Celui-ci est formé de deux lettres pour le type suivi du tiret et du numéro du dosage
     * @param {number} type type d'appareil 0: Ph, 1: cond et 2: pot
     * @param {number} idDosage N° du dosage
     * @returns {string} nouvel ID
     */
    genNewID(type, idDosage){
        const app = ['PH', 'CD', 'PT']
        return app[type] + "_" + idDosage
    }

    /** Ajoute un ID à la liste
     * 
     * @param {string} id ID courbe
     */
    addLstID(id){
        this.lstID.push(id)
    }

    /** Supprime un ID de la liste
     * 
     * @param {string} id ID de courbe
     */
    removeLstID(id){
        this.lstID = this.lstID.filter(v => v !== id)
    }

    /** Retourne l'index dans la tableau charts du graphe identifié par l'ID fourni
     * 
     * @param {string} id ID
     */
    getChartIndexByID(id){
        // On filtre les graphes présents dans charts
        for (let i = 0; i<this.charts.length; i++){
            if (this.charts[i].id == id)
                return i
        }
        return -1
    }

    /** Retourne le dataset du graphe présents dans charts
     * 
     * @param {string} id ID
     * @returns dataset
     */
    getChartByID(id){
        return this.charts.filter(c => c.id == id)[0].dataset
    }

    /** Sauve la courbe courante dans le tableau 'charts'
     */
    saveCurrentGraph(){
        this.charts.filter(c => c.id == this.activeChart)[0].save = true
    }

    /** Supprime un graphe */
    removeGraph(id){
        gGraphs.charts = gGraphs.charts.filter(v => v.id != id)
    }

    /** Modifie la visibilité d'un graphe */
    setVisibility(id, visible){
        this.charts.filter(c => c.id == id)[0].visible = visible
    }
}

// Variable pour enregistrer toutes les informations du programme
class Dosage {

    constructor() {

        /** @type {number} */
        this.type = 0 // type de dosage

        /** @type {import("../../types/types.js").tEquation} */
        this.equation = { // indice de l'équation si type = TYPE_OXYDO
            id: -1,
            params: []
        }

        /** @type {tReactif} */
        this.titre = { // structure précisant l'espèce titrée
            type: 0,
            vol: 0,
            conc: 0,
            indics: "",
            color: ""
        }

        /** @type {tReactif} */
        this.titrant = { // structure précisant l'espèce titrante
            type: 0,
            vol: 0,
            conc: 0,
            indics: "",
            color: ""
        }
        this.solution = { // solution
            vol: 0,
            conc: 0,
            type: 0,
            indics: "",
            color: ""
        }
        this.colProduit = { // contient currentColor et endColor couleurs en cours et finale
            currentColor: "",
            endColor: "",
            finale: ""
        }
        this.etat = cts.ETAT_INITIAL
        this.event = 0
        this.ph = 0 // pH courant
        this.sph = "----" // pH courant formaté
        this.cond = 0 // conductance
        this.scond = "" // texte conductance
        this.pot = 0 // tension potentiomètrique
        this.spot = "" // texte potentiel
        this.indic = null // indicateur coloré
        
        this.pHs = [] // valeurs de pH
        this.vols = [] // volumes ajoutés
        this.dpHs = [] // dérivée du pH
        this.pots = [] // valeurs des potentiels
        this.conds = [] // valeurs des conductances
        this.concs = [] // valeur des concentrations
        this.reactif = { // espèce supplémentaire pour dosage retour
            conc: 0,
            vol: 0,
            type: 0,
            indics: "",
            color: ""
        }
        this.exc = { // espèce excipient (H+)
            vol: 0,
            conc: 0,
            type: 0,
            indics: "",
            color: ""
        }
        this.eau = {
            vol: 0,
            conc: 0,
            type: 0,
            indics: "",
            color: ""
        }
        this.mesure = 0 // indique le type de mesure possible 1 : pH, 2 : conductimètre, 4 : potentiomètre 
        this.inconnu = {
            field: []
        } // contient les informations concernant les problèmes
       
        this.title = ""
        this.typeDetail = undefined
        this.indics = [] // indicateurs
        this.hasReactif = false // indique s'il y a un réactif
        this.hasExc = null // indique la présence d'un excipient
        this.label = ""
        this.lab = undefined;
    }


    /** Définit une valeur pour une propriété
     * 
     * @param {string} name nom de la propriété
     * @param {any} value valeur
     */
    set( name, value ) {
        if ( !isString( name ) ) throw new TypeError( e.ERROR_STR )
        if ( !( name in this ) ) throw new TypeError( e.ERROR_ELT )

        this.name = value
    }

    /** Retourne valeur de la propriété
     * 
     * @param {string} name nom propriété
     * @returns {any} valeur
     */
    get( name ) {
        if ( !isString( name ) ) throw new TypeError( e.ERROR_STR )
        if ( !( name in this ) ) throw new TypeError( e.ERROR_ELT )
        return this[name]
    }

    /** Test si valeur est inclus dans etat ou event
     * 
     * @param {string} name nom propriété
     * @param {number} value valeur
     * @returns {boolean} vrai si value est contenu dans la valeur de la propriété
     */
    test( name, value ) {
        if ( !isString( name ) ) throw new TypeError( e.ERROR_STR )
        if ( !isNumeric( value ) ) throw new TypeError( e.ERROR_NUM )
        let a = this.get(name)
        return ( ( this.get(name) & value ) == value )
    }

    

    /** Modifie la variable "etat"
     * 
     * @param {number} name valeur de l'état défini dans constantes.js
     * @param {number} action précise l'action 1=active, 0=désactive, -1=inverse
     */
    setState( name, action ) {
        if ( !isNumeric( name ) || !isNumeric( action ) ) throw new TypeError( e.ERROR_STR )
        if ( action != 0 && action != 1 && action != -1 ) throw new TypeError( e.ERROR_RANGE )

        switch ( action ) {
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
        localStorage.setItem("dosage", JSON.stringify(this, getCircularReplacer()))
    }
}

// définition d'une instance de Dosage et d'espèces
const gDosage = new Dosage()
const gEspeces = new Especes()
const gDosages = new Dosages()
const gGraphs = new Graphs(DOS_CHART)

gDosages.items.push(gDosage)

function getGlobal(){
    return gDosages.getCurrentDosage()
}

export { Especes, Dosage, Dosages, gDosage, gDosages, gGraphs,gEspeces, gGraphMenu,  getGlobal}
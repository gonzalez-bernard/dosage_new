/** dosage.graphs.js
 * 
 * @module dosage/dosage.graph
 * @description fonctions utilisées pour les graphes
 * ***
 * L'affichage des graphes est géré par le menu des graphes enregistrés et par les appareils de mesures
 * Lors de l'activation d'un appareil (double clic) on regarde si un graphe de même type (pH, cd ou pt) est actif (le graphe est lié à un dosage).
 * Si c'est le cas on réaffiche le graphe sinon on crée un nouveau graphe lié à ce dosage.
 * Lors de la désactivation d'un appareil, on regarde si ce graphe est enregistré
 * Si c'est le cas on cache le graphe s'il est non visible ou on le conserve dans le cas contraire
 * Si le graphe n'est pas enregistré on le cache.
 * Pour les graphes enregistrés : l'icone visibilité est prioritaire
 * Si on décoche un graphe visible dans listMenu, on le cache
 * Si l'appareil est en place on le désactive, on supprime le graphe courant
 * Sinon on cache le graphe.
 * Si on coche un graphe visible, on l'affiche
 * On définit currentGraph et currentDosage
 * Lors de la création d'un nouveau dosage, tous les graphes sont masqués.
 */

import * as ui from "./ui/html_cts.js";
import { cts } from "../environnement/constantes.js";
import { gDosages, gGraphs, gGraphMenu } from "../environnement/globals.js";
import { Graphx } from "./graphx.js";
import { setEventsClick } from "./dosage.events.js";
import { getEltID } from "../modules/utils/html.js"
import { DOS_CHART, DOS_DIV_GRAPH } from "./ui/html_cts.js";
import { uArray } from "../modules/utils/array.js"
import { Dataset } from "../modules/chartX.js";
import { isDefined } from "../modules/utils/type.js";

/**
 * @typedef {import('../../types/classes').Canvas} Canvas
 * @typedef {import("../../types/types.js").tDataset} tDataset 
 * @typedef {import("../../types/types.js").tGraphID} tGraphID
 */

/** Définit une courbe nouvelle
 * 
 * @param {number} app constante indiquant le type d'appareil 
 * @returns 
 */
function defGraph(app){
    const G = gDosages.getCurrentDosage()
    const _options = [cts.GR_OPTIONS_PH, cts.GR_OPTIONS_CD, cts.GR_OPTIONS_PT]
    const _other = [cts.GR_OTHER_PH, cts.GR_OTHER_CD, cts.GR_OTHER_PT]
    const values = [G.pHs, G.conds, G.pots]
    const _names = ['pH','Conductance','Potentiel']
    const idx = Math.log2(app) - 1
    
    
    // Génère l'ID
    const ID = gGraphs.genNewID(idx, gDosages.idCurrentDosage)
    // définit les paramètres
    let options = _options[idx]
    let other = _other[idx]
    options.scales.y.max = Math.round(Math.max(...values[idx]) * 110) / 100
    other.id = ID
    // Crée le graph
    return new Dataset(_names[idx], [], "y", options, other)
}


function createGraph(app, id) {
    let _dataset, arg
    arg = { indice: -1, id: "" }
    const idx = Math.log2(app) - 1
    _dataset = defGraph(app)
    arg = addGraph(_dataset, idx)
    _dataset.setEvent("onHover", setEventsClick);
            
    // On enregistre le dataset créé dans le graphe courant
    gGraphs.currentChart.init(_dataset)
    // on enregistre l'ID de la courbe active
    gGraphs.idCurrentChart = arg.id
    return arg
}

/** Crée un dataset
 *
 * Crée le dataset
 * @param {string} label nom du jeu de données
 * @param {object[]} data jeu de données
 * @param {object} other paramètres du jeu
 * @param {object} option options
 * @param {object} id
 * @returns {tDataset} dataset
 */
/** Enregistre un graphe
 * 
 * @param {tDataset} set graphe à enregistrer
 * @param {number} app type d'appareil
 * @returns {{indice:number,id:string}} ID du graphe ajouté
 * @use Graphs
 * @file dosage.graph.js
 */
function addGraph(set, app) {
  
    // enregistre dans la liste
    // @ts-ignore
    gGraphs.addLstID(set.other.id)
    // Enregistre le graphe
    // @ts-ignore
    gGraphs.charts.push({ id: set.other.id, dataset: set, visible: true, save: false, numDosage: gDosages.idCurrentDosage })

    // @ts-ignore
    return { indice: gGraphs.charts.length - 1, id: set.other.id }
}

/** Supprime une courbe
 * 
 * @param {string} id ID courbe
 * @use Graphs
 * @file dosage.graph
 */
function removeGraph(id) {
    // Si id existe
    if (gGraphs.lstID[id]) {
        // supprime de la liste
        gGraphs.removeLstID(id)
        // retire du tableau
        gGraphs.removeGraph(id)

    }
}

/** Retourne la dernière courbe correspondant au type
 * 
 * @param {string} type 'PH_|CD_|PT_' 
 * @returns {object|undefined}
 */
function getLastGraph(type) {
    // Recherche dernière courbe de type pH donc avec un ID de type PH_xxx
    const charts = gGraphs.charts.filter(e => e.id.sustr(0, 3) == type)
    return charts.slice(-1)[0]
}

/** Initialise ou met à jour les données des graphes
 * 
 * Utilisé lors de l'activation d'un appareil.
 * On calcule l'ID à partir de l'appareil et du numéro du dosage
 * Si ID = activeChart (débranchement appareil) et courbe non enregistrée on enlève la courbe active en place 
 * Sinon On recherche indice dans datasets dans currentGraph à partir de ID de activeChart et on l'enlève du graphX
 * Si ID présent dans charts, donc _getChart renvoie un tGraphID, on l'ajoute à currentGraph et on initialise activeChart
 * Sinon on crée le dataset et on l'ajoute à currentGraph et on initialise activeChart
 * @param {number} app N° du type d'appareil (2, 4 ou 8)
 * @returns {number} index numéro de l'item dans le menu 
 * @use Graphs
 * @use defGraphPH, defGraphCD, defGraphPT, addSet
 * @file dosage.graph.js
 */
function manageGraph(app = 0) {

    if (app == 0) return -1

    const G = gDosages.getCurrentDosage()
    const indice = Math.log2(app) - 1
    const type = ['PH', 'CD', 'PT']
    const ETAT_GRAPH = [cts.ETAT_GRAPH_PH, cts.ETAT_GRAPH_CD, cts.ETAT_GRAPH_PT] 

    // récupère ID du dosage en cours
    const id = type[indice] + "_" + gDosages.idCurrentDosage
    const index = gGraphs.getChartIndexByID(id)

    // si Phmetre actif
    if (G.test('etat', ETAT_GRAPH[indice])) {

        // la courbe existe
        if (index != -1) {
            // si courbe non visible on change son état
            gGraphs.setVisibility(id, true)

            // si graphe enregistré
            if (gGraphs.isSave(index) == true ){

                // on modifie l'icone
                const nligne = gGraphMenu.menu.getPosByID(id)
                if (nligne != -1)
                    gGraphMenu.menu.changeIcon([nligne, 2], 0)
            }

            // active la courbe si graphe unique du même type
            const chartsOfType = gGraphs.charts.filter(elt => elt.id.substr(0,2) == type[indice])
            if (chartsOfType.length == 1){
                gGraphs.idCurrentChart = id
                // @ts-ignore
                //gGraphs.currentChart = new Graphx(ui.DOS_CANVAS)
                //gGraphs.currentChart.init(chartsOfType[0].dataset)
            }
            return index
        } else {
            // la courbe n'existe pas on doit la créer 
            const arg = createGraph(app, id)
            gGraphs.setVisibility(arg.id, true)
            return arg[0]
        }
        // Phmetre inactif
    } else {

        if (index != -1) {
            // si la courbe est visible et sauvée on ne fait rien
            if (gGraphs.isSave(index) == true && gGraphs.isVisible(index))
                return index
            gGraphs.setVisibility(id, false)

            // On annule currentGraph
            gGraphs.idCurrentChart = ''
        } else {
            return index
        }
    }

    /*
    // suppression du graphe existant
    const index = gGraphs.currentChart.getChartByProp("id", id)
    
    if (index != -1) {
        // si courbe non enregistrée et visible on l'efface
        if (gGraphs.charts[index].save == false && gGraphs.charts[index].visible == true) {
            gGraphs.currentChart.chart.destroy()
            gGraphs.currentChart = new Graphx(DOS_CHART)
            gGraphs.idCurrentChart = ""
            gGraphs.setVisibility(id, false)
            return index
        } else
            return index
    }
    // cas branchement appareil, on cherche si une courbe correspondant au dosage et visible existe
    // si non on en crée une
    let tDataset = _getChart(id)
    let _dataset, arg
    if (tDataset) {
        _dataset = tDataset.dataset
        arg = { indice: -1, id: id }
        // gGraphs.currentChart.addDataset(tDataset.dataset)
        // on enregistre l'ID de la courbe active
        //gGraphs.idCurrentChart = id
    } else {
        // On crée le dataset
        arg = { indice: -1, id: "" }
        switch (app) {
            case cts.ETAT_PHMETRE:
                _dataset = defGraphPH(id)
                arg = addSet(_dataset, 0)
                _dataset.setEvent("onHover", setEventsClick);
                break
            case cts.ETAT_COND:
                _dataset = defGraphCD(id)
                arg = addSet(_dataset, 1)
                break
            case cts.ETAT_POT:
                _dataset = defGraphPT(id)
                arg = addSet(_dataset, 2)
                break
        }
    }
    // On enregistre le dataset créé dans le graphe courant
    // @ts-ignore
    gGraphs.currentChart.init(_dataset.label, _dataset.data, _dataset.yAxe, _dataset.other, _dataset.options)
    // on enregistre l'ID de la courbe active
    gGraphs.idCurrentChart = arg.id
    gGraphs.setVisibility(arg.id, true)
    */

    /** Recherche dans charts et Retourne le dataset identifié par son ID
    * 
    * @param {string} id ID
    * @returns {tGraphID}
    */
    function _getChart(id) {
        return gGraphs.charts.filter(e => e.id === id)[0]
    }

    return index
}

function _updGraph(graph) {
    const G = gDosages.getCurrentDosage()
    const state = G.etat & (cts.ETAT_PHMETRE + cts.ETAT_COND + cts.ETAT_POT)

    // si graphe initié on le modifie sinon on le crée
    if (G.test('etat', state)) {
        // mise à jour du graphe
        graph.changeData(graph.data);
    } else {
        var data = [];
        switch (state) {
            case cts.ETAT_PHMETRE:
                data.push({ x: G.titrant.vol, y: G.ph });
                break;
            case cts.ETAT_COND:
                data.push({ x: G.titrant.vol, y: G.cond });
                break;
            case cts.ETAT_POT:
                data.push({ x: G.titrant.vol, y: G.pot });
                break;
        }

        graph.setDatas(data);
        graph.chart.update()
        // on initie l'état 
        G.setState(state, 1)
    }
}

/** Affiche toutes les courbes qui ont la propriété 'visible' à true
 * 
 */
function displayGraphs() {
    // Crée un nouveau graphx
    if (isDefined(gGraphs.currentChart.chart.id)){
        gGraphs.currentChart.chart.destroy()
    }
    
    gGraphs.currentChart = new Graphx(DOS_CHART)
    
    // Parcours les datasets visibles
    const datasets = gGraphs.charts.filter(e => e.visible == true)
    if (datasets.length > 0){
        gGraphs.currentChart.init(datasets[0].dataset)
        for (let i = 1; i < datasets.length; i++){
            gGraphs.currentChart.addDataset(datasets[i].dataset)
        }
    }
}

/** Affiche ou cache le graphe 
 * Le graphe est affiché si etat contient ETAT_PHMETRE ou ETAT_POT ou ETAT_COND
 * ou si il ya des graphes enregistrés et visible
 * 
 * @file dosage.graph.js
 */
function showGraph() {
    const G = gDosages.getCurrentDosage()
    const state = cts.ETAT_PHMETRE + cts.ETAT_COND + cts.ETAT_POT
    let display = false
    if (G.test('etat', state)) {
        display = true
    } else {
        // Recherche s'il existe une courbe affichée
        display = gGraphs.charts.filter(e => e.visible == true).length > 0
    }
    if (display) {
        getEltID(ui.DOS_IMG).hide()
        getEltID(DOS_DIV_GRAPH).show()
    } else {
        getEltID(DOS_DIV_GRAPH).hide()
        getEltID(ui.DOS_IMG).show()
    }
    /*
    getEltID(ui.DOS_IMG).fadeOut(500,'swing')
    getEltID( DOS_GRAPHE ).show();
    getEltID( DOS_DIV_GRAPH ).fadeIn(500,'swing');
    */
    //canvas.redraw();
}

/** Indique si le volume a atteint le max
 * 
 * @param {number} vol volume
 * @returns {boolean} 
 * @file dosage.graph.js
 */
function isLimit(vol) {
    const G = gDosages.getCurrentDosage()
    const C = gGraphs.currentChart

    let resp = false
    if (G.test('etat', (cts.ETAT_COND + cts.ETAT_PHMETRE + cts.ETAT_POT))) {
        if (vol == new uArray(C.chart.data).getArrayObjectExtremumValues("x", "max"))
            resp = true;
    }
    return resp
}

/** Ajoute une valeur au graphe en cours
 * 
 * @param {Graphx} graph graphe en cours
 * @param {number} vol volume
 * @param {number} value valeur en cours
 * @file dosage.graph.js
 */
function addData(graph, vol, value) {
    if (vol != undefined && value != undefined) {
        graph.data.push({ x: vol, y: value });
    }
}


/**
 * Active ou désactive l'affichage d'une courbe
 * Positionne le flag 'visible' du tChartID de charts de l'objet gGraphs
 * @file dosage.graph.js
 * @this {any}
 */
function toggleDisplayGraph(evt) {
    const idx = gGraphMenu.menu.getPos(this)  // récupère indice dans liste
    const id = gGraphMenu.menu.getItems()[idx[0]][0]._text  // récupère ID
    // détecte le type de courbe à l'aide de l'id
    let type
    switch (id.substring(0, 2)) {
        case 'PH':
            type = cts.ETAT_PHMETRE
            break
        case 'PO':
            type = cts.ETAT_POT
            break
        case 'CO':
            type = cts.ETAT_COND
    }
    //const G = gDosages.getCurrentDosage()
    gGraphs.setVisibility(id, -1)

    // cache le graphe courant
    // manageGraph(type)
    displayGraphs()
    showGraph()

}

/** Supprime un graphe à partir du clic sur poubelle
 * 
 * @file dosage.graph.js
 */
function removeGraphMenu() {
    const idx = gGraphMenu.menu.getIndex()  // récupère indice dans liste
    const id = gGraphMenu.menu[idx][1].content  // récupère ID
    removeGraph(id)
}

/** Enregistre la courbe dans le menu
 * 
 * @param {string} name Nom de la courbe
 * @file dosage.graph.js
 */
function addGraphMenu(name) {
    //gGraphMenu.menu.
}


export {defGraph, manageGraph, showGraph, isLimit, addData, removeGraph, toggleDisplayGraph, removeGraphMenu, getLastGraph, displayGraphs }
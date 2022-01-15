/** dosage.graphs.js
 * 
 * @module dosage/dosage.graph
 * @description fonctions utilisées pour les graphes
 * ***
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

/**
 * @typedef {import('../../types/classes').Canvas} Canvas
 * @typedef {import("../../types/types.js").tDataset} tDataset 
 * @typedef {import("../../types/types.js").tGraphID} tGraphID
 */

/** Crée et initialise le dataset pH
 * 
 * @returns {tDataset}
 * @use Dataset
 * @file dosage.graph.js
 */
function defGraphPH(id) {
    const G = gDosages.getCurrentDosage()
    let options = cts.GR_OPTIONS_PH
    options.scales.y.max = Math.round(Math.max(...G.pHs) * 110) / 100
    let other = cts.GR_OTHER_PH
    other.id = id
    return new Dataset("pH", [], "y", options, other)
}

/** Crée et initialise le graphe conductance
 * 
 * @returns {tDataset}
 * @use Dataset
 * @file dosage.graph.js
 */
function defGraphCD(id) {
    const G = gDosages.getCurrentDosage()
    let options = cts.GR_OPTIONS_CD
    let other = cts.GR_OTHER_CD
    other.id = id
    options.scales.y.max = Math.round(Math.max(...G.conds) * 110) / 100
    return new Dataset("Conductance", [], "y", options, other)
    /*
    let gr = new Graphx( ui.DOS_GRAPH_CD)
    gr.init("Conductance", [], cts.GR_OTHER_CD, options )
    gr.setType( 2 )
    gr.setEvent( "onClick", setEventsClick );
    return gr
    */
}

/** Crée et initialise le graphe potentiel
 * 
 * @returns {tDataset}
 * @use Dataset
 * @file dosage.graph.js
 */
function defGraphPT(id) {
    const G = gDosages.getCurrentDosage()
    let options = cts.GR_OPTIONS_PT
    options.scales.y.max = Math.round(Math.max(...G.pots) * 110) / 100
    let other = cts.GR_OTHER_PT
    other.id = id
    return new Dataset("Potentiel", [], "y", options, other)

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
function addSet(set, app) {

    // Génère l'ID
    const ID = gGraphs.genNewID(app, gDosages.currentDosage)
    // enregistre dans la liste
    gGraphs.addLstID(ID)
    // Enregistre le graphe
    // @ts-ignore
    gGraphs.charts.push({ id: ID, dataset: set, visible: true, save: false, numDosage: gDosages.currentDosage })

    return { indice: gGraphs.charts.length - 1, id: ID }
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

/** Initialise ou met à jour les données des graphes
 * 
 * Utilisé lors de l'activation d'un appareil.
 * On calcule l'ID à partir de l'appareil et du numéro du dosage
 * Si ID = activeChart (débranchement appareil) on enlève la courbe active en place 
 * Sinon On recherche indice dans datasets dans currentGraph à partir de ID de activeChart et on l'enlève du graphX
 * Si ID présent dans charts, donc _getChart renvoie un tGraphID, on l'ajoute à currentGraph et on initialise activeChart
 * Sinon on crée le dataset et on l'ajoute à currentGraph et on initialise activeChart
 * @returns void
 * @use Graphs
 * @use defGraphPH, defGraphCD, defGraphPT, addSet
 * @file dosage.graph.js
 */
function manageGraph(app = 0) {

    const G = gDosages.getCurrentDosage()
    const indice = app == 0 ? 0 : Math.log2(app) - 1
    const type = ['PH', 'CD', 'PT']
    const id = type[indice] + "_" + gDosages.currentDosage

    if (app == 0) return

    // suppression du graphe existant
    const index = gGraphs.currentGraph.getChartByProp("id", id)
    // la courbe existe, on est dans la situation de débranchement de l'appareil
    if (index != -1) {
        gGraphs.currentGraph.chart.destroy()
        gGraphs.currentGraph = new Graphx(DOS_CHART)
        gGraphs.activeChart = ""
        gGraphs.setVisibility(id, false)
        return
    }

    // cas branchement appareil, on cherche si une courbe correspondant au dosage et visible existe
    // si non on en crée une
    let tDataset = _getChart(id)
    let _dataset, arg
    if (tDataset) {
        _dataset = tDataset.dataset
        arg = { indice: -1, id: id }
        // gGraphs.currentGraph.addDataset(tDataset.dataset)
        // on enregistre l'ID de la courbe active
        //gGraphs.activeChart = id
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
    gGraphs.currentGraph.init(_dataset.label, _dataset.data, _dataset.yAxe, _dataset.other, _dataset.options)
    // on enregistre l'ID de la courbe active
    gGraphs.activeChart = arg.id
    gGraphs.setVisibility(arg.id, true)

    /** Recherche dans charts et Retourne le dataset identifié par son ID
    * 
    * @param {string} id ID
    * @returns {tGraphID}
    */
    function _getChart(id) {
        return gGraphs.charts.filter(e => e.id === id)[0]
    }
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
 * @param {Canvas} canvas 
 */
function displayGraphs(canvas) {

}

/** Affiche le graphe selon la valeur de etat
 * @file dosage.graph.js
 */
function displayGraph() {
    const G = gDosages.getCurrentDosage()
    if (G.etat & (cts.ETAT_PHMETRE + cts.ETAT_POT + cts.ETAT_COND)) {
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
    const C = gGraphs.currentGraph

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


/** Active ou désactive l'affichage d'une courbe
 *  Positionne le flag 'visible' du tChartID de charts de l'objet gGraphs
 *  @file dosage.graph.js
 */
function activeDisplayGraph() {
    const idx = gGraphMenu.menu.getIndex()  // récupère indice dans liste
    const id = gGraphMenu.menu[idx][1].content  // récupère ID
    const g = gGraphs.charts.filter(e => e.id === id)[0]
    g.visible = !g.visible
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


export { defGraphCD, defGraphPT, defGraphPH, manageGraph, displayGraph, isLimit, addData, removeGraph, activeDisplayGraph, removeGraphMenu }
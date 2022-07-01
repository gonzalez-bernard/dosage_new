/** dosage.graphs.js
 * 
 * @module dosage/dosage.graph
 * @description fonctions utilisées pour les graphes
 * ***
 * Un seul chart est créé lors de l'initialisation par la méthode 'createChart'
 * Lors d'un nouveau dosage ou quand on change d'appareil, on initialise le map 'charts'
 * Le map 'charts' contient :
 *  - une clé qui identifie le type de mesure et le dosage x : ph0 ou cd1
 *
 *  - un objet contenant les paramètres utiles pour recréer la courbe :
 *      - max {number} : valeur maximale utilisée pour initialiser max et calculer tickAmount
 *      - visible {boolean}
 *      - save {boolean}
 *      - data [{x:number,y:number}] : données
 *    
 * L'affichage ou le masquage des graphes est déclenché par action (double clic) sur les  appareils de mesures ou par le menu des graphes enregistrés éventuels. On se base sur les courbes enregistrées dans 'charts' pour reconstruire le chart.
 * 
 * Il ne peut pas y avoir plus de 2 graphes de type différents affichés en même temps.
 * La gestion est assurée par l'objet 'gGraphs'
 *  - currentGraph contient l'objet de type 'graphx' qui gère les courbes affichées.
 * 
 * Evénément : activation d'un appareil (double clic) 
 *  - on regarde si 2 courbes sont déjà affichées (chart.series.w.series.length):
 *      -- si oui on affiche un message d'erreur
 *      -- si non on regarde si un graphe de même ID est enregistré dans charts (le graphe est lié à un dosage).
 *          --- si oui, on modifie la propriété visible
 *              ---- on regarde si courbe enregistrée
 *                  ----- si oui on modifie l'icone
 *          --- si non on crée un nouveau jeu de données lié à ce dosage, on l'enregistre dans 'charts'
 *  - on repositionne l'appareil
 * 
 * Evénement : Désactivation d'un appareil 
 *  le jeu de données est donc créé et la courbe visible
 *  - on modifie visible
 *  - on repositionne l'appareil 
 * 
 * Evénement : On décoche un graphe visible dans listMenu. 
 *  - on modifie visible
 *  - on regarde si appareil activé
 *      -- si oui on le remet en place
 * 
 * Evénement: on coche un graphe visible
 *  - on regarde si 2 courbes de type différents sont affichées
 *      -- si oui message d'erreur
 *      -- si non modifie visible
 * 
 * Evénement: création d'un nouveau dosage
 *  - tous les graphes sont masqués, suppression dans currentChart, propriété visible à false.
 *  
 */

import * as ui from "./ui/html_cts.js";
import { cts } from "../environnement/constantes.js";
import { gDosage, gGraphs, gGraphMenu, gLab } from "../environnement/globals.js";
import { getEltID } from "../modules/utils/html.js"
import { DOS_DIV_GRAPH } from "./ui/html_cts.js";
import { uArray } from "../modules/utils/array.js"
import { copyDeep, isEmpty } from "../modules/utils/object.js";
import { updateAppareil } from "./ui/appareil.js";
import { getOptionsFromCharts } from "./classes/graphs.js";
import { getKeyFromPropertyValue } from "../modules/utils/maps.js";

/**
 * @typedef {import('../../types/classes').Canvas} Canvas
 * @typedef {import("../../types/types.js").tDataset} tDataset 
 * @typedef {import("../../types/types.js").tGraphID} tGraphID
 */

/** Initialise ou met à jour les données des graphes
 * 
 * Utilisé lors de l'activation d'un appareil.
 * On calcule l'ID à partir de l'appareil et du numéro du dosage
 * Si ID = activeChart (débranchement appareil) et courbe non enregistrée on enlève la courbe active en place 
 * Sinon On recherche indice dans datasets dans currentGraph à partir de ID de activeChart et on l'enlève du graphX
 * Si ID présent dans charts, donc _getChart renvoie un tGraphID, on l'ajoute à currentGraph et on initialise activeChart
 * Sinon on crée le dataset et on l'ajoute à currentGraph et on initialise activeChart
 * @param {number} app N° du type d'appareil (1, 2 ou 3)
 * @param {number} action -1 : action sur appareil, 0 : icone visibilité ON et 1 : OFF
 * @returns {number|undefined} index numéro de l'item dans le menu 
 * @use Graphs
 * @use defGraphPH, defGraphCD, defGraphPT, addSet
 * @file dosage.graph.js
 */
function graphManager(app, action, _id = '') {

    //if (app == 0) return -1
    app = app - 1
    const CLIC_APPAREIL = -1
    const CLIC_ICONE_ON = 0
    const CLIC_ICONE_OFF = 1

    let id

    // action sur un appareil
    if (action == CLIC_APPAREIL) {

        // appareil non actif donc on l'active
        if (gDosage.getState('APPAREIL_TYPE') != 0) {

            // si le graphe en cours correspond à celui du dosage
            if (gGraphs.idCurrentChart == gDosage.id) {

                // on modifie l'icone
                gGraphs.setVisibility(gDosage.id, true)
            } else {
                // si la courbe n'existe pas on la crée
                if (gGraphs.getState('GRAPH_INIT') == 0) {
                    try {
                        gGraphs.currentChart.createChart('chart', gDosage.id)
                        gGraphs.setState('GRAPH_INIT', 1)
                    } catch (err) {
                        console.error(err)
                    }

                    // ajoute la courbe à charts
                    addGraphCharts(gDosage.id, { visible: true, save: false, type: app + 1, data: [] })

                    // on vide le tableau data dans currentChart
                    gGraphs.currentChart.data = []

                } else {
                    // la courbe existe 
                    if (gGraphs.charts.has(gDosage.id)) {
                        // on modifie l'icone
                        gGraphs.setVisibility(gDosage.id, true)

                        // on récupère les données
                        gGraphs.currentChart.data = copyDeep(gGraphs.charts.get(gDosage.id).data)
                    }
                }

            }

            gGraphs.idCurrentChart = gDosage.id
            //gDosage.setState('APPAREIL_TYPE', 0)
            gDosage.setState('GRAPH_TYPE', app + 1)

            _updGraphMenuIcon(gDosage.id, 1)

            // Appareil inactivé
        } else {
            // modifie visibilité
            gGraphs.setVisibility(gDosage.id, false)
            _updGraphMenuIcon(gDosage.id, 0)

            // active la première courbe visible du tableau charts
            /*
            const id = getKeyFromPropertyValue(gGraphs.charts, 'visible', true)
            if (id) {
                gGraphs.idCurrentChart = id
                _updGraphMenuIcon(id, 1)

            } else
                gGraphs.idCurrentChart = ""
            */
            //updGraphCharts(id)

            //gDosage.setState('APPAREIL_ACTIF', 0)
            //gDosage.setState('GRAPH_TYPE', 0)
        }


    } else if (action == CLIC_ICONE_ON || action == CLIC_ICONE_OFF) {
        // clic sur icone visibilité
        const APPAREILS = [gLab.phmetre, gLab.conductimetre, gLab.potentiometre]

        // Affiche courbe
        if (action == CLIC_ICONE_OFF) {
            /*
            if (gGraphs.getState("GRAPH_INIT") == 0) {
                gGraphs.currentChart.createChart('chart', _id)
                gGraphs.setState('GRAPH_INIT', 1)
            }
            */

            // état visible
            gGraphs.setVisibility(_id, true)
            _updGraphMenuIcon(_id, 1)

            // gGraphs.setState('GRAPH_TYPE', gGraphs.charts.get(_id).type)
        }
        else {
            // if (gGraphs.getState('GRAPH_TYPE') == 0) return

            // désactive l'appareil  si id correspond à currentID et appareil actif
            if (_id == gGraphs.idCurrentChart && gDosage.getState("APPAREIL_ACTIF") == 1) {
                updateAppareil(APPAREILS[app], gLab.becher)
                gDosage.setState('APPAREIL_ACTIF', 0)
            }

            // état caché
            gGraphs.setVisibility(_id, false)
            _updGraphMenuIcon(_id, 0)
            gGraphs.idCurrentChart = ""

            // si autre courbe affichée on la définit comme courante
            const id = getKeyFromPropertyValue(gGraphs.charts, 'visible', true)
            if (id) {
                gGraphs.idCurrentChart = id
                _updGraphMenuIcon(id, 1)
            }
        }
        // gDosage.setState('GRAPH_TYPE', 0)
    }


}

function updGraphMenuIcon() {

    for (const [key, e] of gGraphs.charts) {
        _updGraphMenuIcon(key, e.visible)
    }
}

/** Modifie l'icone de visibilité 
     * 
     * @param {string} id ID du graphe
     * @param {number} state 0: cache, 1 : affiche 
     * @returns 
     */
function _updGraphMenuIcon(id, state) {
    if (gGraphs.isSave(id) == true) {
        const nligne = gGraphMenu.getRowIndexByID(id)
        if (nligne != -1) {
            gGraphMenu.changeIcon([nligne, 2], 1 - state)
        }
    }
}

/** Enregistre les données et les options dans le tableau charts
 * 
 * @param {string} id identifiant du graphe à enregistrer
 * @use Graphs
 * @file dosage.graph.js
 */
function updGraphCharts(id) {
    const o = gGraphs.charts.get(id)
    o.data = copyDeep(gGraphs.currentChart.data)
    gGraphs.charts.set(id, o)
}

function addGraphCharts(id, options) {
    gGraphs.charts.set(id, options)
}

/** Supprime une courbe
 * 
 * @param {string} id ID courbe ou index dans datasets
 * @use Graphs
 * @file dosage.graph
 */
function removeGraph(id) {

    // flag visible = false du tableau charts
    gGraphs.charts.get(id).visible = false
}


function _removeData(chart) {
    chart.resetSeries();
}

function updateScales(chart, options) {
    let k = Object.keys(chart.scales)
    let c = []
    k.forEach(e => {
        c.push(chart.scales[e])
    });

    chart.options.scales = copyDeep(options)
    chart.update();

    // need to update the reference
    k = Object.keys(options)
    for (let i = 0; i < c.length; i++) {
        c[i] = chart.scales[k[i]]
    }
}


/** Affiche toutes les courbes qui ont la propriété 'visible' à true
 * @file dosage.graphs.js
 */
function displayGraphs() {
    // efface toutes les courbes

    gGraphs.currentChart.hChart.chart.update({
        series: [],
        yAxis: {}
    })


    // On parcourt les graphes enregistrés dans charts
    let options = getOptionsFromCharts()

    if (!isEmpty(options))
        gGraphs.currentChart.hChart.update(options, true, true)
}

/** Affiche ou cache le graphe 
 * Le graphe est affiché si etat contient APPAREIL_ACTIF actif
 * ou si il ya des graphes enregistrés et visible
 * 
 * @file dosage.graph.js
 */
function showGraph() {
    let display = false
    // Recherche s'il existe une courbe affichée
    
    if (gGraphs.charts.size > 0)
        display = Array.from(gGraphs.charts.values()).filter(e => e.visible === true).length > 0;

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
    const C = gGraphs.currentChart

    let resp = false
    if (gDosage.getState('APPAREIL_ACTIF') != 0) {
        if (vol == new uArray(C.chart.data).getArrayObjectExtremumValues("x", "max"))
            resp = true;
    }
    return resp
}

/** Active ou désactive l'affichage d'une courbe à partir du menu
 * 
 * Positionne le flag 'visible' du tChartID de charts de l'objet gGraphs
 * Remet l'appareil en place si actif
 * @file dosage.graph.js
 * @this {any}
 */
function toggleDisplayGraph(evt) {
    const idx = gGraphMenu.getPos(this)  // récupère indice image dans liste
    const id = gGraphMenu.getItems()[idx[0]][0]._text  // récupère ID
    const item = gGraphMenu.getItems()[idx[0]][idx[1]] // item icone

    const app = _getAppareil(id).type
    graphManager(app, item.options.idx, id)

    displayGraphs()
    showGraph()

}

/** retourne information sur appareil en fonction de l'ID
 * 
 * @param {string} id ID du dosage
 * @returns {{type:number, app: Phmetre|Conductimetre|Potentiometre}}
 * @typedef {import("./ui/appareil.js").Phmetre} Phmetre}
 * @typedef {import("./ui/appareil.js").Conductimetre} Conductimetre}
 * @typedef {import("./ui/appareil.js").Potentiometre} Potentiometre}
*/
function _getAppareil(id) {
    const type = ['ph', 'cd', 'pt']
    const app = [gLab.phmetre, gLab.conductimetre, gLab.potentiometre]
    let t = type.indexOf(id.substr(0, 2))
    return { type: t + 1, app: app[t] }
}

/** Supprime l'enregistrement d'un graphe à partir du clic sur poubelle
 * 
 * @file dosage.graph.js
 *  @this {any}
 */
function removeGraphMenu(evt) {

    // supprime la courbe dans tableau 'charts'
    const idx = gGraphMenu.getPos(this)  // récupère indice dans liste
    const id = gGraphMenu.getItems()[idx[0]][0]._text  // récupère ID
    gGraphs.charts.delete(id)

    // supprime l'item de menu
    gGraphMenu.removeItem(this)
}

/** Enregistre la courbe dans le menu
 * 
 * @param {string} name Nom de la courbe
 * @file dosage.graph.js
 */
function addGraphMenu(name) {
    //gGraphMenu.menu.
}


export { graphManager, showGraph, isLimit, removeGraph, toggleDisplayGraph, removeGraphMenu, displayGraphs, updGraphCharts, addGraphCharts, updGraphMenuIcon }

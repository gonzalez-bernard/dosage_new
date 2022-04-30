/** dosage.graphs.js
 * 
 * @module dosage/dosage.graph
 * @description fonctions utilisées pour les graphes
 * ***
 * L'affichage ou le masquage des graphes est déclenché par le menu des graphes enregistrés éventuels et par les appareils de mesures.
 * Il ne peut pas y avoir plus de 2 graphes de type différents affichés en même temps.
 * La gestion est assurée par l'objet 'gGraphs'
 *  - currentGraph contient l'objet de type 'graphx' qui gère les courbes affichées.
 *  - charts est un tableau qui mémorise toutes les courbes créées. 
 *      -- la propriété visible indique si la courbe est affichée.
 *      -- la propriété save indique si la courbe est enregistrée.
 * 
 * Evénément : activation d'un appareil (double clic) 
 *  - on regarde si 2 courbes sont déjà affichées :
 *      -- si oui on affiche un message d'erreur
 *      -- si non on regarde si un graphe de même ID est enregistré dans charts (le graphe est lié à un dosage).
 *          --- si oui on réaffiche le graphe, on modifie la propriété visible
 *              ---- on regarde si courbe enregistrée
 *                  ----- si oui on modifie l'icone
 *          --- si non on crée un nouveau graphe lié à ce dosage, on l'enregistre dans 'charts'
 * 
 * Evénement : Désactivation d'un appareil 
 *  - on regarde si ce graphe est enregistré
 *      -- si oui on teste la propriété visible
 *          --- si visible activé on ne fait rien (l'icone visibilité est prioritaire)
 *          --- si non on cache le graphe, suppression dans currentChart
 *      -- si non on le cache suppression dans currentChart
 * 
 * Evénement : On décoche un graphe visible dans listMenu. 
 *  - on cache le graphe
 *  - on regarde si appareil activé
 *      -- si oui on le remet en place
 * 
 * Evénement: on coche un graphe visible
 *  - on regarde si 2 courbes de type différents sont affichées
 *      -- si oui message d'erreur
 *      -- si non on affiche le graphe
 * 
 * Evénement: création d'un nouveau graphe
 *  - tous les graphes sont masqués, suppression dans currentChart, propriété visible à false.
 *  
 */

import * as ui from "./ui/html_cts.js";
import { cts } from "../environnement/constantes.js";
import { gDosages, gGraphs, gGraphMenu } from "../environnement/globals.js";
import { setEventsClick } from "./dosage.events.js";
import { getEltID } from "../modules/utils/html.js"
import { DOS_DIV_GRAPH } from "./ui/html_cts.js";
import { uArray } from "../modules/utils/array.js"
import { Dataset } from "../modules/chartX.js";
import { hasKey, replace, copyDeep } from "../modules/utils/object.js";
import { updateAppareil } from "./ui/appareil.js";

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
function defGraph(app) {
    const G = gDosages.getCurrentDosage()
    const _options = [cts.GR_OPTIONS_PH, cts.GR_OPTIONS_CD, cts.GR_OPTIONS_PT]
    const _other = [cts.GR_OTHER_PH, cts.GR_OTHER_CD, cts.GR_OTHER_PT]
    const values = [G.pHs.map(Number), G.conds.map(Number), G.pots.map(Number)]
    const _names = ['pH', 'Conductance', 'Potentiel']
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

/** Crée un graphe
 * 
 * @param {number} app indique le type de mesures 
 * @returns {{indice: number, id: string}}
 */
function createGraph(app) {
    let arg, options, dataset

    const G = gDosages.getCurrentDosage()
    const _other = [cts.GR_OTHER_PH, cts.GR_OTHER_CD, cts.GR_OTHER_PT]
    const _names = ['pH', 'Conductance', 'Potentiel']
    const idx = app - 1

    arg = { indice: -1, id: "" }

    // Génère l'ID
    const ID = gGraphs.genNewID(idx, gDosages.idCurrentDosage)

    // génère le nom de l'axe y (iAxisID)
    const yName = gGraphs.genYName(idx, gDosages.idCurrentDosage)

    // définit les paramètres
    let other = _other[idx]
    other.id = ID

    // Si aucun graphe en cours on le crée
    if (hasActiveGraph() == -1) {
        options = getOption(-1, idx, yName)
        dataset = gGraphs.currentChart.createDataset(_names[idx], [], yName, other)
        const data = gGraphs.currentChart.setData(dataset, [yName])
        const config = gGraphs.currentChart.setConfig('scatter', data, options)
        gGraphs.currentChart.createChart(config)
        arg = addGraphCharts(dataset, options)
        G.setState('GRAPH_TYPE', G.getState('APPAREIL_TYPE'))
    }

    else {
        options = getOption(-1, idx, yName)
        dataset = gGraphs.currentChart.createDataset(_names[idx], [], yName, other)
        gGraphs.currentChart.addChart(_names[idx], dataset)
        gGraphs.currentChart.addOption('scales', options)
        arg = addGraphCharts(dataset, options)
    }


    // Enregistre le graphe
    //arg = addGraphCharts(dataset, options)
    gGraphs.currentChart.setEvent("onHover", setEventsClick);

    // on enregistre l'ID de la courbe active
    gGraphs.idCurrentChart = arg.id
    return arg
}

function hasActiveGraph() {
    if (!hasKey(gGraphs.currentChart.chart, 'id'))
        return -1

    return gGraphs.currentChart.chart.data.datasets.length
}

/** Retourne l'option
 * 
 * @param {number} type indique le type d'option
 * @param {number} idx 0 = pH, 1 = CD et 2 = PT 
 * @returns {object} option
 */

function getOption(type, idx, yName) {
    const G = gDosages.getCurrentDosage()
    const values = [G.pHs.map(Number), G.conds.map(Number), G.pots.map(Number)]
    const _options = [cts.GR_OPTIONS_PH, cts.GR_OPTIONS_CD, cts.GR_OPTIONS_PT]

    let o = {}

    if (type == -1) { // axes x et (pH ou cd ou pt){
        o = copyDeep(cts.GR_OPTIONS)
        o.animation = false
        o['scales'][yName] = copyDeep(_options[idx])
        replace(o['scales'][yName], { max: Math.max(...values[idx]) })
        replace(o, { position: 'left' }, '', true)
        return o
    }
    else {
        o[yName] = copyDeep(_options[idx])
        replace(o[yName], { max: Math.max(...values[idx]) })

        // test si il y a déjà une courbe affichée dans ce cas l'axe est à droite.
        if (!hasActiveGraph())
            replace(o[yName], { position: 'left' }, '', true)
        else
            replace(o[yName], { position: 'right' }, '', true)
        return o
    }
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

/** Enregistre le dataset et les options dans le tableau charts
 * 
 * @param {tDataset} dataset graphe à enregistrer
 * @param {object} option type d'appareil
 * @returns {{indice:number,id:string}} indice et ID du graphe ajouté
 * @use Graphs
 * @file dosage.graph.js
 */
function addGraphCharts(dataset, option) {

    // enregistre dans la liste
    // @ts-ignore
    gGraphs.addLstID(dataset.id)
    // Enregistre le graphe
    // @ts-ignore
    gGraphs.charts.push({ id: dataset.id, dataset: dataset, options: option, visible: true, save: false, numDosage: gDosages.idCurrentDosage })

    // @ts-ignore
    return { indice: gGraphs.charts.length - 1, id: dataset.id }
}

function updGraphsCharts(indexs) {
    gGraphs.charts[indexs.vrt].dataset.data = gGraphs.currentChart.chart.data.datasets[indexs.dsp].data
}

/** Supprime une courbe
 * 
 * @param {string} id ID courbe ou index dans datasets
 * @use Graphs
 * @file dosage.graph
 */
function removeGraph(id) {

    // Si id existe
    if (gGraphs.lstID.indexOf(id) == -1) return false
    // supprime de la liste
    gGraphs.removeLstID(id)
    // flag visible = false du tableau charts
    const indexs = gGraphs.getChartIndexByID(id)
    if (indexs.vrt != -1)
        gGraphs.charts[indexs.vrt].visible = false
    // supprime la courbe
    gGraphs.currentChart.removeChart(gGraphs.getChartIndexByID(id).dsp)
    // remplace l'ID
    const _id = gGraphs.lstID.length == 0 ? "" : gGraphs.lstID[0]
    gGraphs.idCurrentChart = _id

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
 * @param {number} app N° du type d'appareil (1, 2 ou 3)
 * @param {number} action -1 : action sur appareil, 0 : icone visibilité ON et 1 : OFF
 * @returns {number|undefined} index numéro de l'item dans le menu 
 * @use Graphs
 * @use defGraphPH, defGraphCD, defGraphPT, addSet
 * @file dosage.graph.js
 */
function manageGraph(app, action) {

    if (app == 0) return -1

    const G = gDosages.getCurrentDosage()
    const type = ['ph', 'cd', 'pt']

    // récupère ID du dosage en cours et index de la courbe (-1 si pas de courbe)
    let id = type[app-1] + gDosages.idCurrentDosage
    const indexs = gGraphs.getChartIndexByID(id)

    // action sur un appareil
    if (action == -1) {
        // si activation Appareil
        if (G.getState('APPAREIL_ON') == 0) {

            // la courbe existe
            if (indexs.vrt == -1) {
                const arg = createGraph(app)
                id = arg.id
            }
            updGraphMenuIcon(id, indexs.vrt, 0)
            gGraphs.setVisibility(id, true)
            gGraphs.idCurrentChart = id
            gGraphs.addLstID(id)
            G.setState('APPAREIL_ON',1)
            // Appareil inactivé
        } else {
            gGraphs.idCurrentChart = ''
            gGraphs.removeLstID(id)
            updGraphsCharts(indexs)
            updGraphMenuIcon(id, indexs.vrt, 1)
            gGraphs.setVisibility(id, false)
            G.setState('APPAREIL_ON',0)

        }
    } else {
        // clic sur icone visibilité
        if (action == 0) {
            gGraphs.setVisibility(id, true)
        }
        else {
            if (G.getState('GRAPH_TYPE') != 0) {
                G.setState('GRAPH_TYPE', 0)
            }
            updGraphsCharts(indexs)
            gGraphs.setVisibility(id, false)
        }
    }

    function updGraphMenuIcon(id, chartsIndex, state) {
        if (chartsIndex == -1) return
        if (state == 0) {
            if (gGraphs.isSave(chartsIndex) == true) {
                const nligne = gGraphMenu.menu.getPosByID(id)
                if (nligne != -1) {
                    gGraphMenu.menu.changeIcon([nligne, 2], 0)
                    console.log("courbe sauvée -> modification icone -> visible")
                }
            }
        } else {
            if (gGraphs.isSave(chartsIndex) == true && gGraphs.isVisible(chartsIndex)) {
                console.log("courbe sauvée et visible -> supprime visibilité")
                const nligne = gGraphMenu.menu.getPosByID(id)
                if (nligne != -1) {
                    gGraphMenu.menu.changeIcon([nligne, 2], 1)
                    console.log("courbe sauvée -> modification icone -> non visible")
                }
            }
        }
    }

}



/** Affiche toutes les courbes qui ont la propriété 'visible' à true
 * 
 */
function displayGraphs() {
    // efface toutes les courbes
    gGraphs.currentChart.chart.data = [];
    //gGraphs.currentChart.chart.options = {};

    // reconstruit le dataset et les options
    const visibleCharts = gGraphs.charts.filter(e => e.visible == true)
    if (visibleCharts.length == 0) return false
    let datasets = []
    let labels = []
    let options = { ...cts.GR_OPTIONS_SCALE }
    let index = 0
    visibleCharts.forEach((chart) => {
        datasets.push(chart.dataset)
        labels.push(chart.dataset.yAxisID)
        if (index == 0)
            options = { ...options['scales'], ...chart.options.scales }
        else
            options = replace(options, chart.options.scales[chart.dataset.yAxisID], chart.dataset.yAxisID)
        index++
    })

    gGraphs.currentChart.chart.data['datasets'] = copyDeep(datasets)
    gGraphs.currentChart.chart.data['labels'] = copyDeep(labels)
    gGraphs.currentChart.chart.options.scales = copyDeep(options)
    gGraphs.currentChart.chart.update()

}

/** Affiche ou cache le graphe 
 * Le graphe est affiché si etat contient APPAREIL_ON actif
 * ou si il ya des graphes enregistrés et visible
 * 
 * @file dosage.graph.js
 */
function showGraph() {
    const G = gDosages.getCurrentDosage()
    let display = false
    if (G.getState('APPAREIL_ON') != 0) {
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
    if (G.getState('APPAREIL_ON') != 0) {
        if (vol == new uArray(C.chart.data).getArrayObjectExtremumValues("x", "max"))
            resp = true;
    }
    return resp
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
    const item = gGraphMenu.menu.getItems()[idx[0]][idx[1]] // item icone
    // détecte le type de courbe à l'aide de l'id

    // Change visibilité
    gGraphs.setVisibility(id, -1)

    // supprime le graphe du currentGraph
    const dosage = gDosages.getCurrentDosage()
    manageGraph(dosage.getState('GRAPH_TYPE'), item.options.idx)
    if (!gGraphs.getVisibility(id) && (dosage.getState('GRAPH_TYPE') == 1))
        updateAppareil(gDosages.dosages[0].lab.phmetre, gDosages.dosages[0].lab.becher)

    displayGraphs()
    showGraph()

}

/** Supprime l'enregistrement d'un graphe à partir du clic sur poubelle
 * 
 * @file dosage.graph.js
 *  @this {any}
 */
function removeGraphMenu(evt) {

    // supprime la courbe dans tableau 'charts'
    const idx = gGraphMenu.menu.getPos(this)  // récupère indice dans liste
    const id = gGraphMenu.menu.getItems()[idx[0]][0]._text  // récupère ID
    gGraphs.charts.splice(gGraphs.getChartIndexByID(id).vrt)

    // supprime l'item de menu
    gGraphMenu.menu.removeItem(this)
}

/** Enregistre la courbe dans le menu
 * 
 * @param {string} name Nom de la courbe
 * @file dosage.graph.js
 */
function addGraphMenu(name) {
    //gGraphMenu.menu.
}


export { manageGraph, showGraph, isLimit, removeGraph, toggleDisplayGraph, removeGraphMenu, getLastGraph, displayGraphs, updGraphsCharts, addGraphCharts, getOption, hasActiveGraph }

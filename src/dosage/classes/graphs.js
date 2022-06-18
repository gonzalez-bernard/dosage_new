import { Graph } from "./graph.js"
import { getValues } from "../dosage.datas.js"
import { cts } from "../../environnement/constantes.js"
import { around, getDecimal } from "../../modules/utils/number.js"
import { gDosage, gGraphs } from "../../environnement/globals.js"
import { copyDeep } from "../../modules/utils/object.js"
import { setEventsClick } from "../dosage.events.js"

/**
 * @classdesc Cette classe permer de préciser la courbe active ainsi que les paramètres et valeurs des courbes enregistrées.
 * Les courbes sont mémorisées dans le tableau 'charts'
 */
class Graphs {

    constructor(canvas) {

        /** tableau de structure (tGraphID) enregistrement des courbes 
         * - {id: {string} généré automatiquement ex: ph0, cd0,...
         * - name: {string} nom choisi, data {[]} : données, visible: {boolean}
         * - save: {boolean},numDosage: {number}, type {number}: 1, 2 ou 3}
        */
        this.charts = new Map()

        /** @type {string} ID de la courbe active  */
        this.idCurrentChart = ""

        /** @type {Graph} en cours */
        this.currentChart = new Graph(canvas)

    }

    /** Calcule et retourne un ID de courbe
     * 
     * Celui-ci est formé de deux lettres pour le type suivi du tiret et du numéro du dosage
     * @param {number} type type d'appareil 0: Ph, 1: cond et 2: pot
     * @param {number} idDosage N° du dosage
     * @returns {string} nouvel ID
     */
    genNewID(type, idDosage) {
        const app = ['ph', 'cd', 'pt']
        return app[type] + idDosage
    }

    /** Modifie la visibilité d'un graphe dans le tableau 'charts' de gGraphs
     * 
     * @param {string} id ID du graphe
     * @visible {boolean|-1} indique l'état de visibilité, si -1 on inverse l'état 
    */
    setVisibility(id, visible) {
        const o = this.charts.get(id)
        if (o === undefined) return
        if (visible == -1)
            o.visible = !o.visible
        else
            o.visible = visible
    }

    /** Retourne si un graphe est visible en fonction du ID
     * 
     * @param {string} id ID
     * @return {boolean}
     */
    isVisible(id) {
        return this.charts.get(id).visible
    }

    /** indique si le graphe est sauvé
     * 
     * @param {string} id 
     * @returns {boolean}
     */
    isSave(id) {
        return this.charts.get(id).save
    }

    /** Actualise flag 'Save' dans le tableau 'charts'
     * 
     * @param {string} id ID courbe
     * @param {boolean} state indique l'état du flag
     * @file graphs.js
    */
    setChartSaveFlag(id, state) {
        let val = this.charts.get(id)
        val.save = state
        this.charts.set(id, val)
    }
}


function _getYaxeName(id) {
    const _values = ['pH', 'Conductance (mS)', 'Potentiel (V)']
    const _types = ['ph', 'cd', 'pt']

    // index 0 = pH, 1 = CD et 2 = PT 
    return _values[_types.indexOf(id.substring(0, 2))]
}

/** Crée la structure pour générer le graphe
 * - utilise les informations présentes dans le tableau charts
 * @returns {{}} Structure pour créer les graphes
 */
function getOptionsFromCharts() {
    let options = {}, indice = 0

    gGraphs.charts.forEach((value, id) => {

        if (value.visible == true) {
            const values = getValues(id)
            // courbe initiale
            if (indice == 0) {
                options = getOption(id)
                options.series[0].name = id
                options.series[0].data = value.data
                options.yAxis[0].title.text = _getYaxeName(id)
                options.yAxis[0].name = id
                options.yAxis[indice].max = around(Math.max(...values))
                options.yAxis[indice].min = 0
                options.yAxis[indice].tickInterval = 1
            } else {
                //const _values = [gDosage.pHs.map(Number), gDosage.conds.map(Number), gDosage.pots.map(Number)]
                //const _types = ['ph', 'cd', 'pt']
                //const index = _types.indexOf(id.substring(0, 2))
                options.yAxis.push(copyDeep(cts._GR_YAXES.yAxis))
                options.series.push({ name: id, data: value.data })
                options.yAxis[indice].max = Math.max(...values)
                options.yAxis[indice].seriesName = id
                options.yAxis[indice].opposite = true
                options.yAxis[indice].title.text = _getYaxeName(id)
                options.yAxis[indice].decimalsInFloat = getDecimal(options.yAxis[indice].max) + 1
                //options.yAxis[indice].tickAmount = 10
            }

            indice++;
        }
    })

    return options
}


/** Retourne l'option
* 
* @param {string} id
* @returns {object} option
*/
function getOption(id, chartsIndex = 0, data = []) {
    const values = getValues(id)
    let options = jQuery.extend(true, {}, cts._GR_OPTIONS)
    options['chart']['events'] = {
        click: (e) => {
            gGraphs.currentChart.activeEventMouse(e)
        }
    }
    let y = jQuery.extend(true, {}, cts._GR_YAXES.yAxis)
    options = { ...options, yAxis: [y] }
    options = {
        ...options, series: [
            {
                name: id,
                data: data,
                events: {
                    click: (evt) => {
                        setEventsClick(evt)
                    }
                },
                marker: {
                    radius: 2
                }
            }]
    }
    options.yAxis[chartsIndex].max = around(Math.max(...values))
    options.yAxis[chartsIndex].name = id
    options.yAxis[chartsIndex].opposite = chartsIndex == 0 ? false : true
    //options.yAxis[chartsIndex].decimalsInFloat = 1 + getDecimal(Math.max(...values))
    //options.yAxis[chartsIndex].tickAmount = 10

    return options
}

export { Graphs, getOption, getOptionsFromCharts }
import { Graph } from "./graph.js"
import { getValues } from "../dosage.datas.js"
import { cts, ETATS_GRAPH, ETATS_GRAPH_INIT } from "../../environnement/constantes.js"
import { around, getDecimal } from "../../modules/utils/number.js"
import { gDosage, gGraphs } from "../../environnement/globals.js"
import { copyDeep } from "../../modules/utils/object.js"
import { setEventsClick } from "../dosage.events.js"
import { isArray, isBoolean, isNumeric, isString } from "../../modules/utils/type.js"
import * as E from "../../modules/utils/errors.js"
import * as ui from "../ui/html_cts.js"
import { setButtonClass, setButtonState } from "../dosage.ui.js"
import { dspContextInfo } from "../../infos/infos.js"

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

        this.etats = copyDeep(ETATS_GRAPH)
    }

    /** Calcule et retourne un ID de courbe
     * 
     * Celui-ci est formé de deux lettres pour le type suivi du tiret et du numéro du dosage
     * @param {number} type type d'appareil 0: Ph, 1: cond et 2: pot
     * @param {number} idDosage N° du dosage
     * @returns {string} nouvel ID
     */
    genNewID(type, idDosage) {
        if (!(type in [1, 2, 3])) E.debugError(E.ERROR_RANGE)
        if (!isNumeric(idDosage)) E.debugError(E.ERROR_NUM)

        const app = ['ph', 'cd', 'pt']
        return app[type] + idDosage
    }

    /** Modifie la visibilité d'un graphe dans le tableau 'charts' de gGraphs
     * 
     * @param {string} id ID du graphe
     * @visible {boolean|-1} indique l'état de visibilité, si -1 on inverse l'état 
    */
    setVisibility(id, visible) {
        if (!isString(id)) E.debugError(E.ERROR_STR)
        if (visible !== true && visible !== false && visible !== -1) E.debugError(E.ERROR_PRM)

        const o = this.charts.get(id)
        if (o)
            if (visible == -1)
                o.visible = !o.visible
            else
                o.visible = visible
        else
            E.debugError(E.ERROR_RETURN)
    }

    /** Retourne si un graphe est visible en fonction du ID
     * 
     * @param {string} id ID
     * @return {boolean|void}
     */
    isVisible(id) {
        if (!isString(id)) E.debugError(E.ERROR_STR)
        const o = this.charts.get(id)
        if (o)
            return o.visible
        else
            E.debugError(E.ERROR_RETURN)
    }

    /** indique si le graphe est sauvé
     * 
     * @param {string} id 
     * @returns {boolean|void}
     */
    isSave(id) {
        if (!isString(id)) E.debugError(E.ERROR_STR)
        // @ts-ignore
        const o = this.charts.get(id)
        if (o)
            return o.save
        else
            E.debugError(E.ERROR_RETURN)
    }

    /** Actualise flag 'Save' dans le tableau 'charts'
     * 
     * @param {string} id ID courbe
     * @param {boolean} state indique l'état du flag
     * @file graphs.js
    */
    setChartSaveFlag(id, state) {
        if (!isString(id)) E.debugError(E.ERROR_STR)
        if (!isBoolean(state)) E.debugError(E.ERROR_BOOL)

        let o = this.charts.get(id)
        if (o) {
            o.save = state
            this.charts.set(id, o)
        } else {
            E.debugError(E.ERROR_RETURN)
        }
    }

    setState(etat, value) {
        this.etats[etat] = value
    }

    getState(etat) {
        return this.etats[etat]
    }

    /** Réinitialise les graphes
    * - réinitialise les tableaux data
    * - supprime les courbes (tangente,...)
    * - désactive visibilité graphes
    * 
    */
    reset() {

        // On remet à zéro le graphe courant
        if (this.idCurrentChart != '') {
            //gGraphs.charts.get(gGraphs.idCurrentChart).data = []
            this.currentChart.data = []
            this.currentChart.data_theorique = []
            this.currentChart.data_derive_theorique = []

            // supprime les courbes si présentes
            if (this.getState('TANGENTE') == 1) {
                setTangente(1, ui.DOS_BT_TAN1)
                setButtonClass(ui.DOS_BT_TAN1, 0)
            }
            if (this.getState('TANGENTE') == 2) {
                setTangente(1, ui.DOS_BT_TAN2)
                setButtonClass(ui.DOS_BT_TAN2, 0)
            }
            if (this.getState('PERPENDICULAIRE') == 1) {
                gGraphs.currentChart.dspPerpendiculaire(0)
                this.setState('PERPENDICULAIRE', 0)
                setButtonClass(ui.DOS_BT_PERP, 0)
            }
            if (this.getState('THEORIQUE') == 1) {
                this.currentChart.dspCourbeTheorique(0)
                setButtonClass(ui.DOS_BT_COTH, 0)
            }

            // désactive visibilité de tous les graphes
            this.charts.forEach(e => { e.visible = false })
        }
    }

    resetState(){
        ETATS_GRAPH_INIT.forEach((e) => {
            this.setState(e, 0)
        })
    }

}

/** action lors du clic sur boutons tangente
 * 
 * @param {number} idTangente N° de la tangente
 * @param {string} idBtTangente ID bouton
 * @use _dspPerpendiculaire, setButtonState, setButtonClass
 */
 function setTangente(idTangente, idBtTangente) {

    const currentChart = gGraphs.currentChart

    // si tan déjà affichée on l'efface
    if (gGraphs.getState('TANGENTE') & idTangente) {
        gDosage.event = gGraphs.getState('TANGENTE') ^ idTangente
        gGraphs.setState('TANGENTE', gDosage.event)
        currentChart.delTangente(idTangente);

        currentChart.indiceTangentes[idTangente] = -1

        // supprime la perpendiculaire si existe
        if (gGraphs.getState('PERPENDICULAIRE') == 1) {
            currentChart.dspPerpendiculaire(0)
            gGraphs.setState("PERPENDICULAIRE", 0)

        }
        // activation des boutons
        setButtonState()
    } else {
        gDosage.event = idTangente
        dspContextInfo("dspTangente")
    }
    gGraphs.setState('MOVE_TANGENTE', 0)

}


function _getYaxeName(id) {
    if (!isString(id)) E.debugError(E.ERROR_STR)

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
* @param {string} id id de la courbe
* @param {number} chartsIndex indice de la courbe
* @param {[]} data tableau des valeurs
* @returns {object} option
*/
function getOption(id, chartsIndex = 0, data = []) {
    if (!isString(id)) E.debugError(E.ERROR_STR)
    if (!isNumeric(chartsIndex)) E.debugError(E.ERROR_NUM)
    if (!isArray(data)) E.debugError(E.ERROR_ARRAY)

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

var gGraphListenUpdate = (data, o) => {
    const vars = ['GRAPHMENU_INIT', 'GRAPH_INIT', 'GRAPH_TYPE']
    if (vars.indexOf(data.property) != -1) {
        if (E.DEBUG == E.ERROR_L2)
            console.error(data)
        else if (E.DEBUG == E.ERROR_L3)
            console.log(data)
    }
    
}

export { Graphs, getOption, getOptionsFromCharts, setTangente, gGraphListenUpdate }
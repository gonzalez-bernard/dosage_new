/************************************ 
 * dosage.events
 * 
**************************************/

import { cts, etats } from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";
import * as e from "../modules/utils/errors.js"
import { getEltID } from "../modules/utils/html.js";
import { gDosages, gGraphMenu, gGraphs, gLab } from "../environnement/globals.js";
import { isObject } from "../modules/utils/type.js";
import { setPosFlacons, set_drag } from "./ui/flacon.js"
import { resetMesures } from "./dosage.datas.js"
import { setButtonState, setButtonClass, dspTabDosage } from "./dosage.ui.js"
import { vidage } from "./dosage.js"
import { dspInfo, dspContextInfo } from "../infos/infos.js";
import { dspTabEspeces, initDataInfo } from "../especes/interface.js";
import { Graphx } from "../dosage/graphx.js";
import { updGraphsCharts, hasActiveGraph } from "./dosage.graph.js";
import { Dosage } from "./classes/dosage.js"


/** Définit events
 *
 * @use vidage
 * @file dosage.events
 */
function setEvents() {

    const dosage = gDosages.getCurrentDosage()
    const currentChart = gGraphs.currentChart

    if (!isObject(gLab.canvas)) throw new TypeError((e.ERROR_OBJ))

    // Initie un listener d'événement de redimensionnement
    // @ts-ignore
    window.addEventListener("resize", debouncedResize);
    var debounceTimeoutHandle;

    function debouncedResize() {
        clearTimeout(debounceTimeoutHandle); // Clears any pending debounce events
        debounceTimeoutHandle = setTimeout(_resizeCanvas, 100);
    }

    /** Gère le redimensionnement
     * @file dosage.events
     */
    function _resizeCanvas() {

        if (etats.PERPENDICULAIRE == 1) {
            etats.PERPENDICULAIRE = 0
            currentChart.chart.dspPerpendiculaire();
        }
    }


    /** bouton reset (réinitialise le dosage) */
    getEltID(ui.DOS_BT_RESET).on("click", function () {
        reset(false)
        etats.INDIC = 1 - etats.INDIC

        // désactive les boutons enregistrer
        setButtonClass(ui.DOS_BT_SAVE_GRAPH, 0)
        setButtonState()
        set_drag(gLab.flacons, true)
    })

    /** bouton new_dosage (réinitialise lee espèces) */
    getEltID(ui.DOS_BT_NEW_DOSAGE).on("click", function () {

        // On incrémente le N° du dosage et on ajoute un dosage
        gDosages.idCurrentDosage += 1;
        gDosages.dosages.push(new Dosage())
        //gGraphs.currentChart.chart = {}
        gGraphs.charts.forEach(e => { e.visible = false })

        // si une courbe existe on position le flag GRAPH_ON à 1
        //if (hasActiveGraph() != -1)
        //    gDosages.getCurrentDosage().setState('GRAPH_ON', 1)

        //reset(true)

        //updateAppareil(lab.phmetre, lab.becher);

        // désactive les boutons
        setButtonClass("")

        // On bascule sur le premier onglet
        dspTabEspeces(true)
        dspTabDosage(false)

    });

    /** Vidange burette avec touche 'v' */
    gLab.canvas.bind("keydown", function () {
        var key = gLab.canvas.keyboard.getKeysDown();
        // @ts-ignore
        if (key.includes(86) && dosage.getState('ESPECES_INIT') == 1) {
            // @ts-ignore
            vidage(gLab, dosage);

            // réaffichage du graphe
            const indexs = gGraphs.getChartIndexByID(gGraphs.idCurrentChart)
            gGraphs.currentChart.showChart(indexs.dsp)
        }
    });

    /** fin du vidage */
    gLab.canvas.bind("keyup", function () {
        gLab.burette.leave("burette_o");
    });

    /** bouton affichage dérivée */
    getEltID(ui.DOS_BT_DERIVEE).on("click", function () {
        let currentChart = gGraphs.currentChart
        if (dosage.getState('DERIVEE_EXP') == 1) {
            dosage.event = 0
            let idx = currentChart.getChartByProp("id", "derivee")
            if (!idx) return;
            currentChart.removeData(idx);
            setButtonClass(ui.DOS_BT_DERIVEE, 0)

        } else {
            currentChart.dspDerivee()
            setButtonClass(ui.DOS_BT_DERIVEE, 1)

        }
        dosage.setState('MOVE_TANGENTE', 0)
        dosage.setState('DERIVEE_EXP', -1)
    });

    /** boutons affichage tangentes */
    getEltID(ui.DOS_BT_TAN1).on("click", function () {
        _setTangente(1, ui.DOS_BT_TAN1)
    });

    /** affichage tangente N°2 */
    getEltID(ui.DOS_BT_TAN2).on("click", function () {
        _setTangente(2, ui.DOS_BT_TAN2)
    });

    /** affichage perpendiculaire */
    getEltID(ui.DOS_BT_PERP).on("click", function () {

        let currentChart = gGraphs.currentChart
        // si pas de perpendiculaire tracée
        if (dosage.getState('THEORIQUE')) {
            dosage.event = 0
            currentChart.dspPerpendiculaire(1)
            currentChart.indiceTangentes[2] = 0
            setButtonClass(ui.DOS_BT_PERP, 0)
            setButtonState()
            dosage.setState('PERPENDICULAIRE', -1)
        } else {
            // @ts-ignore
            currentChart.dspPerpendiculaire(0)

        }
    });

    /** affiche graphe théorique */
    getEltID(ui.DOS_BT_COTH).on("click", function () {
        let currentChart = gGraphs.currentChart
        // courbe théorique affichée
        if (dosage.getState('THEORIQUE')) {
            dosage.event = 0
            // efface courbe 
            currentChart.dspCourbeTheorique(1)
            setButtonClass(ui.DOS_BT_COTH, 0)
            //setButtonState()
            //getEltID(ui.DOS_BT_DERIVEE).prop("disabled", true)
        } else {
            setButtonClass(ui.DOS_BT_COTH, - 1)
            currentChart.dspCourbeTheorique(0)
            getEltID(ui.DOS_BT_DERIVEE).removeAttr("disabled")
        }
        dosage.setState('MOVE_TANGENTE', 0)
        dosage.setState('THEORIQUE', -1)
    });

    /** affiche information */
    getEltID(ui.DOS_BT_dspINFO).on("click", null, { 'arg': dosage, fct: initDataInfo }, dspInfo);

    /** sortie du menu déroulant de liste des graphes */
    getEltID('menu').on('mouseleave', function (e) {
        $('#fond').hide()
    })

    /** Enregistre la courbe en cours */
    getEltID(ui.DOS_BT_SAVE_GRAPH).on("click", function () {

        // modifie le flag 'save' du tableau 'charts'
        gGraphs.saveCurrentGraph()
        const indexs = gGraphs.getChartIndexByID(gGraphs.idCurrentChart)
        updGraphsCharts(indexs)


        // affiche la boite de dialogue pour choisir le nom de la courbe
        gGraphMenu.dialog.display()

    })
}

/** Réinitialise
    * 
    * @param {boolean} all
    * Pour chaque dosage présents dans gDosages on efface les mesures si la variable 'all' = true
    * On réinitialise la burette, le bécher, l'affichage des appareils et les flacons
    * Si 'all' on supprime le graphe courant sinon on conserve le graphe mais on efface les données
    * @file dosage.events
    */
function reset(all = false) {

    // @ts-ignore
    const currentChart = gGraphs.currentChart


    gDosages.dosages.forEach((dosage) => {

        // réinitialise les constantes de dosage
        resetMesures(all);

        // réinitialise la burette
        gLab.burette.reset();

        // réinitialise le bécher
        gLab.becher.reset(dosage.solution.vol);

        gLab.burette.canvas.redraw();

        // actualise l'affichage
        gLab.phmetre.setText(dosage.sph);
        gLab.conductimetre.setText(dosage.scond);
        gLab.potentiometre.setText(dosage.spot)

        // positionne les flacons
        setPosFlacons(gLab.flacons)

        // supprime l'indicateur
        dosage.indic = null

        if (all) {
            // On remet à zéro le graphe courant
            const indexs = gGraphs.getChartIndexByID(gGraphs.idCurrentChart)
            gGraphs.currentChart = new Graphx(ui.DOS_CHART)
            // On efface les données dans le graphe mémorisé dans 'charts'
            // gGraphs.charts = gGraphs.charts.slice(indexs.dsp,0)

        } else {
            // réinitialise les graphes
            if (dosage.getState('GRAPH_TYPE') == 1 && dosage.getState('APPAREIL_ON') == 1) {
                if (dosage.getState('TANGENTE') == 1)
                    currentChart.removeData(currentChart.getChartByProp('id', 'tan1'))
                if (dosage.getState('TANGENTE') == 2)
                    currentChart.removeData(currentChart.getChartByProp('id', 'tan2'))
                if (dosage.getState('PERPENDICULAIRE') == 1)
                    currentChart.removeData(currentChart.getChartByProp('id', 'perp'))
                if (dosage.getState('DERIVEE') == 1)
                    currentChart.removeData(currentChart.getChartByProp('id', 'derivee'))
                if (dosage.getState('THEORIQUE') == 1)
                    currentChart.removeData(currentChart.getChartByProp('id', 'theo'))
            }

            if (dosage.getState('GRAPH_TYPE') != 0 && currentChart) {
                currentChart.removeData(0);
                currentChart.data = []
            }
        }
    })
}


/** action lors du clic sur boutons tangente
 * 
 * @param {number} idTangente N° de la tangente
 * @param {string} idBtTangente ID bouton
 * @use _dspPerpendiculaire, setButtonState, setButtonClass
 */
function _setTangente(idTangente, idBtTangente) {

    const dosage = gDosages.getCurrentDosage()
    const currentChart = gGraphs.currentChart

    // si tan déjà affichée on l'efface
    if (dosage.getState('TANGENTE') == idTangente) {
        dosage.event = 0
        currentChart.delTangente(idTangente);
        dosage.setState('TANGENTE', 0)

        // supprime la perpendiculaire si existe
        if (dosage.getState('PERPENDICULAIRE') == 1)
            // @ts-ignore
            _dspPerpendiculaire(currentChart.graph)

        setButtonState()
    } else {
        dosage.event = idTangente
        dspContextInfo("dspTangente")
    }
    dosage.setState('MOVE_TANGENTE', 0)
    setButtonClass(idBtTangente, -1)
}

/** Gestion de la perpendiculaire
 * 
 * @param {Graphx} _this - instance graphx
 * @access private
 * @memberof dosage.events
 */
function _dspPerpendiculaire(_this) {
    const dosage = gDosages.getCurrentDosage()
    const dsp_perp = _this.dspPerpendiculaire(dosage.getState('PERPENDICULAIRE'))
    if (dsp_perp == 1) {
        // affichage réussi
        setButtonClass(ui.DOS_BT_PERP, -1)
        dspContextInfo("perp_move")
        dosage.setState('PERPENDICULAIRE', 1)
    } else if (dsp_perp == -1) {
        // erreur d'affichage
        dspContextInfo("err_pentes")
    } else {
        // perpendiculaire effacée
        setButtonClass(ui.DOS_BT_PERP, -1)
        dspContextInfo("perp_del")
        dosage.setState('PERPENDICULAIRE', 0)
        dosage.setState('MOVE_TANGENTE', 0)
    }
}

/** Gère le clic sur les courbes
 *
 * @param {object} evt
 * @param {import("chart.js").ActiveElement[]} elt
 * @use delTangente, dspTangente, movTangente, setButtonState
 *
 * Clic sur bouton tangente X: on fixe TANGENTE = X, MOVE_TANGENTE = 0, PERPENDICULAIRE = 0
 * 
 * Clic sur point du canvas :
 * - si aucune courbe on annule les états
 * - si courbe pH et TANGENTE actif on vérifie la présence d'une tangente précedente, on l'efface et on trace la nouvelle
 * - si courbe tangente on bascule entre mode normal et mode move.
 *  
 * Déplacement sur canvas:
 * - si aucune courbe on annule les états
 * - si courbe pH on ne fait rien
 * - si courbe tangente et MOVE_TANGENTE actif on déplace la tangente
 *
 *
 *  */
function setEventsClick(evt, elt = []) {

    let chartIndex, chartID, selectedPoint
    const dosage = gDosages.getCurrentDosage()
    const currentChart = gGraphs.currentChart

    // On désactive tout
    if (elt.length != 0) {

        chartIndex = currentChart.getEventIndexChart(elt);
        chartID = currentChart.getIdChart(chartIndex).id
        selectedPoint = currentChart.getEventIndicePoint(elt)


        // si type == clic
        if (evt.type == "click") {

            // paramètre du clic
            const idTangente = dosage.event // défini par clic sur bouton tan1 ou tan2

            // si courbe expérimentale pH
            if (chartIndex == 0) {

                // test si on est en mode affichage des tangentes
                if (dosage.event != 1 && dosage.event != 2)
                    return false

                // test si tangente déjà tracée
                if (currentChart.indiceTangentes[idTangente - 1] != 0) {

                    // on ne fait rien si déjà tracée au même point
                    if (selectedPoint == currentChart.indiceTangentes[idTangente - 1])
                        return false;

                    currentChart.delTangente(idTangente);
                    currentChart.indiceTangentes[idTangente - 1] = 0
                }

                // Affiche la tangente
                currentChart.dspTangente(chartIndex, elt, idTangente);

                // enregistre l'indice du point de la tangente
                currentChart.indiceTangentes[idTangente - 1] = selectedPoint;
                if (idTangente == 1)
                    dosage.setState('TANGENTE', 1) // tan1 tracée
                else
                    dosage.setState('TANGENTE', 2) // tan1 tracée

                /*
             // active bouton tangente N°2
             getEltID(ui.DOS_BT_TAN2).removeAttr("disabled");
             if (idTangente == 2)
                 getEltID(ui.DOS_BT_PERP).removeAttr("disabled");
             setButtonClass("")
             */
                setButtonState()

            } else if (chartID == "tan1" || chartID == "tan2" || chartID == "perp") {

                // active ou désactive le déplacement de la tangente
                if (selectedPoint == 1) return // pas d'action sur le point tangent
                dosage.setState('TANGENTE', -1) // tan1 tracée
                currentChart.tangente_point = currentChart.getEventIndicePoint(elt);
                currentChart.activePoints = currentChart.getData(elt);
            }

            // déplacement souris
        } else if (evt.type == "mousemove" && dosage.getState('MOVE_TANGENTE')) {
            if (selectedPoint == currentChart.tangente_point) {
                currentChart.movTangente(evt, currentChart.tangente_point, currentChart.activePoints, chartIndex);
            }
        }
    }
}

export { setEvents, setEventsClick, reset }
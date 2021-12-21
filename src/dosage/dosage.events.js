import { cts } from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";
import * as e from "../modules/utils/errors.js"
import { getEltID } from "../modules/utils/html.js";
import { gDosages, Dosage, gGraphs } from "../environnement/globals.js";
import { isObject } from "../modules/utils/type.js";
import { setPosFlacons, set_drag } from "./ui/initFlacon.js"
import { resetMesures } from "./dosage.datas.js"
import { setButtonState, setButtonClass, dspTabDosage } from "./dosage.ui.js"
import { vidage, createGraph } from "./dosage.js"
import { dspInfo, dspContextInfo } from "../infos/infos.js";
import { dspTabEspeces, initDataInfo } from "../especes/especes.ui.js";
import { updateAppareil } from "./ui/initAppareil.js";

/**
* @typedef {import('../../types/classes').Graphx} Graphx 
* 
*/



/** Définit events
 *
 * @private 
 * @use vidage
 *
 */
function setEvents() {

    const G = gDosages.getCurrentDosage()
    const C = gGraphs.charts[gDosages.currentDosage]

    const lab = G.lab
    if (!isObject(lab.canvas)) throw new TypeError((e.ERROR_OBJ))

    // Initie un listener d'événement de redimensionnement
    window.addEventListener("resize", debouncedResize);
    var debounceTimeoutHandle;

    /* ------------------------------------------- */
    function debouncedResize() {
        clearTimeout(debounceTimeoutHandle); // Clears any pending debounce events
        debounceTimeoutHandle = setTimeout(resizeCanvas, 100);
    }

    /** canvas resize
     *
     */
    function resizeCanvas() {

        if (G.test('etat', cts.ETAT_PERPENDICULAIRE)) {
            G.setState(cts.ETAT_PERPENDICULAIRE, -1)
            C.chartPH.dspPerpendiculaire();
        }
    }

    /* ------------------------------------------- */
    /* checkbox pour conservation des courbes */
    /* ------------------------------------------- */
    getEltID(ui.DOS_CHK_GRAPH).on("change", function () {
        gDosages.saveGraphs = getEltID(ui.DOS_CHK_GRAPH).is(":checked")
    });

    /* ------------------------------------------- */
    // bouton reset (réinitialise le dosage)
    /* ------------------------------------------- */
    getEltID(ui.DOS_BT_RESET).on("click", function () {
        reset(false)
        G.setState(cts.ETAT_INDIC, -1)

        // désactive les boutons
        setButtonClass("")
        set_drag(lab.flacons, true)
    })

    /* ------------------------------------------- */
    // bouton new_dosage (réinitialise lee espèces)
    /* ------------------------------------------- */
    getEltID(ui.DOS_BT_NEW_DOSAGE).on("click", function () {

        // si conservation des courbes
        if (gDosages.saveGraphs) {
            // On crée un nouveau dosage
            gDosages.currentDosage++
            createGraph()
            gDosages.items.push(new Dosage())
            
        } else {
            reset(true)
        }

        updateAppareil(lab.phmetre, lab.becher);

        // désactive les boutons
        setButtonClass("")

        // On bascule sur le premier onglet
        dspTabEspeces(true)
        dspTabDosage(false)
    });

    /* ------------------------------------------- */
    // Vidange burette avec touche 'v'
    /* ------------------------------------------- */
    lab.canvas.bind("keydown", function () {
        var key = lab.canvas.keyboard.getKeysDown();
        // @ts-ignore
        if (key.includes(86) && G.test('etat', cts.ETAT_ESPECES)) {
            vidage(lab, gDosages);
        }
    });

    /* ------------------------------------------- */
    // fin du vidage
    /* ------------------------------------------- */
    lab.canvas.bind("keyup", function () {
        lab.burette.leave("burette_o");
    });

    /* ------------------------------------------- */
    // bouton affichage dérivée
    /* ------------------------------------------- */
    getEltID(ui.DOS_BT_DERIVEE).on("click", function () {
        if (G.test('etat', cts.ETAT_DERIVEE)) {
            G.event = 0
            let idx = C.chartPH.getChartByProp("id", "derivee")
            if (!idx) return;
            C.chartPH.removeData(idx);
            setButtonClass(ui.DOS_BT_DERIVEE, 0)

        } else {
            C.chartPH.dspDerivee()
            setButtonClass(ui.DOS_BT_DERIVEE, 1)

        }
        G.setState(cts.ETAT_MOVE_TANGENTE, 0)
        G.setState(cts.ETAT_DERIVEE, -1)
    });

    /* ------------------------------------------- */
    // boutons affichage tangentes
    /* ------------------------------------------- */
    getEltID(ui.DOS_BT_TAN1).on("click", function () {
        _setTangente(1, cts.ETAT_TANGENTE_1, ui.DOS_BT_TAN1)
    });

    // affichage tangente N°2
    getEltID(ui.DOS_BT_TAN2).on("click", function () {
        _setTangente(2, cts.ETAT_TANGENTE_2, ui.DOS_BT_TAN2)
    });

    /* ------------------------------------------- */
    // affichage perpendiculaire
    /* ------------------------------------------- */
    getEltID(ui.DOS_BT_PERP).on("click", function () {

        // si pas de perpendiculaire tracée
        if (G.test('etat', cts.ETAT_THEORIQUE)) {
            G.event = 0
            C.chartPH.dspPerpendiculaire(1)
            C.chartPH.indiceTangentes[2] = 0
            setButtonClass(ui.DOS_BT_PERP, 0)
            setButtonState()
            G.setState(cts.ETAT_PERPENDICULAIRE, -1)
        } else {
            // @ts-ignore
            _dspPerpendiculaire(C.chartPH)

        }
    });

    /* ------------------------------------------- */
    // affiche graphe théorique
    /* ------------------------------------------- */
    getEltID(ui.DOS_BT_COTH).on("click", function () {

        // courbe théorique affichée
        if (G.test('etat', cts.ETAT_THEORIQUE)) {
            G.event = 0
            // efface courbe 
            let idx = C.chartPH.getChartByProp("id", "theo")
            if (!idx) return;
            C.chartPH.removeData(idx);
            //C.chartPH.dspCourbeTheorique(1)
            setButtonClass(ui.DOS_BT_COTH, 0)
            //setButtonState()
            //getEltID(ui.DOS_BT_DERIVEE).prop("disabled", true)
        } else {
            setButtonClass(ui.DOS_BT_COTH, -1)
            C.chartPH.dspCourbeTheorique(0)
            getEltID(ui.DOS_BT_DERIVEE).removeAttr("disabled")
        }
        G.setState(cts.ETAT_MOVE_TANGENTE, 0)
        G.setState(cts.ETAT_THEORIQUE, -1)
    });

    // affiche information
    getEltID(ui.DOS_BT_dspINFO).on("click", null, { 'arg': G, fct: initDataInfo }, dspInfo);

}

/** Réinitialise
    * 
    * @param {boolean} all 
    */
function reset(all = false) {

    const G = gDosages.getCurrentDosage()
    const C = gGraphs.charts[gDosages.currentDosage]

    
gDosages.items.forEach((G) => {

        // réinitialise les constantes de dosage
        resetMesures(all);

        // réinitialise la burette
        G.lab.burette.reset();

        // réinitialise le bécher
        G.lab.becher.reset(G.solution.vol);

        G.lab.burette.canvas.redraw();

        // actualise l'affichage
        G.lab.phmetre.setText(G.sph);
        G.lab.conductimetre.setText(G.scond);
        G.lab.potentiometre.setText(G.spot)

        // positionne les flacons
        setPosFlacons(G.lab.flacons)

        // supprime l'indicateur
        G.indic = null

        // réinitialise les graphes
        if (G.test('etat', cts.ETAT_GRAPH_PH)) {
            if (G.test('etat', cts.ETAT_TANGENTE_1))
                C.chartPH.removeData(C.chartPH.getChartByProp('id', 'tan1'))
            if (G.test('etat', cts.ETAT_TANGENTE_2))
                C.chartPH.removeData(C.chartPH.getChartByProp('id', 'tan2'))
            if (G.test('etat', cts.ETAT_PERPENDICULAIRE))
                C.chartPH.removeData(C.chartPH.getChartByProp('id', 'perp'))
            if (G.test('etat', cts.ETAT_DERIVEE))
                C.chartPH.removeData(C.chartPH.getChartByProp('id', 'derivee'))
            if (G.test('etat', cts.ETAT_THEORIQUE))
                C.chartPH.removeData(C.chartPH.getChartByProp('id', 'theo'))
        }

        if (G.test('etat', cts.ETAT_GRAPH_CD) && C.chartCD) {
            C.chartCD.clearData(0);
            C.chartCD.data = []
        }
        if (G.test('etat', cts.ETAT_GRAPH_PH) && C.chartPH) {
            C.chartPH.clearData(0);
            C.chartPH.data = []
        }
        if (G.test('etat', cts.ETAT_GRAPH_PT) && C.chartPT) {
            C.chartPT.clearData(0);
            C.chartPT.data = []
        }
    })
}


/** action lors du clic sur boutons tangente
 * 
 * @param {number} idTangente N° de la tangente
 * @param {number} ctsTangente constante identifiant tangente
 * @param {string} idBtTangente ID bouton
 * @use _dspPerpendiculaire, setButtonState, setButtonClass
 */
function _setTangente(idTangente, ctsTangente, idBtTangente) {

    const G = gDosages.getCurrentDosage()
    const C = gGraphs.charts[gDosages.currentDosage]

    // si tan déjà affichée on l'efface
    if (G.test('etat', ctsTangente)) {
        G.event = 0
        C.chartPH.delTangente(idTangente);
        G.setState(ctsTangente, 0)

        // supprime la perpendiculaire si existe
        if (G.test('etat', cts.ETAT_PERPENDICULAIRE))
            // @ts-ignore
            _dspPerpendiculaire(C.chartPH)

        setButtonState()
    } else {
        G.event = idTangente
        dspContextInfo("dspTangente")
    }
    G.setState(cts.ETAT_MOVE_TANGENTE, 0)
    setButtonClass(idBtTangente, -1)
}

/** Gestion de la perpendiculaire
 * 
 * @param {Graphx} _this - instance graphx
 * @access private
 * @memberof dosage.events
 */
function _dspPerpendiculaire(_this) {
    const G = gDosages.getCurrentDosage()
    const dsp_perp = _this.dspPerpendiculaire(G.test('etat', cts.ETAT_PERPENDICULAIRE) ? 1 : 0)
    if (dsp_perp == 1) {
        // affichage réussi
        setButtonClass(ui.DOS_BT_PERP, -1)
        dspContextInfo("perp_move")
        G.setState(cts.ETAT_PERPENDICULAIRE, 1)
    } else if (dsp_perp == -1) {
        // erreur d'affichage
        dspContextInfo("err_pentes")
    } else {
        // perpendiculaire effacée
        setButtonClass(ui.DOS_BT_PERP, -1)
        dspContextInfo("perp_del")
        G.setState(cts.ETAT_PERPENDICULAIRE, 0)
        G.setState(cts.ETAT_MOVE_TANGENTE, 0)
    }
}

/** Gère le clic sur les courbes
 *
 * @param {Event} evt
 * @param {unknown[]} elt
 * @use delTangente, dspTangente, movTangente, setButtonState
 *
 * Clic sur bouton tangente X: on fixe ETAT_TANGENTE_X = 1, ETAT_TANGENTE_Y = 0, ETAT_MOVE_TANGENTE = 0, ETAT_PERPENDICULAIRE = 0
 * 
 * Clic sur point du canvas :
 * - si aucune courbe on annule les états
 * - si courbe pH et ETAT_TANGENTE_X actif on vérifie la présence d'une tangente précedente, on l'efface et on trace la nouvelle
 * - si courbe tangente on bascule entre mode normal et mode move.
 *  
 * Déplacement sur canvas:
 * - si aucune courbe on annule les états
 * - si courbe pH on ne fait rien
 * - si courbe tangente et ETAT_MOVE_TANGENTE actif on déplace la tangente
 *
 *
 *  */
function setEventsClick(evt, elt = []) {

    let chartIndex, chartID, selectedPoint
    const G = gDosages.getCurrentDosage()
    const C = gGraphs.charts[gDosages.currentDosage]

    // On désactive tout
    if (elt.length != 0) {

        chartIndex = C.chartPH.getEventIndexChart(elt);
        chartID = C.chartPH.getIdChart(chartIndex).id
        selectedPoint = C.chartPH.getEventIndicePoint(elt)


        // si type == clic
        if (evt.type == "click") {

            // paramètre du clic
            const idTangente = G.event // défini par clic sur bouton tan1 ou tan2

            // si courbe expérimentale pH
            if (chartIndex == 0) {

                // test si on est en mode affichage des tangentes
                if (G.event != 1 && G.event != 2)
                    return false

                // test si tangente déjà tracée
                if (C.chartPH.indiceTangentes[idTangente - 1] != 0) {

                    // on ne fait rien si déjà tracée au même point
                    if (selectedPoint == C.chartPH.indiceTangentes[idTangente - 1])
                        return false;

                    C.chartPH.delTangente(idTangente);
                    C.chartPH.indiceTangentes[idTangente - 1] = 0
                }

                // Affiche la tangente
                C.chartPH.dspTangente(chartIndex, elt, idTangente);

                // enregistre l'indice du point de la tangente
                C.chartPH.indiceTangentes[idTangente - 1] = selectedPoint;
                if (idTangente == 1)
                    G.setState(cts.ETAT_TANGENTE_1, 1) // tan1 tracée
                else
                    G.setState(cts.ETAT_TANGENTE_2, 1) // tan1 tracée

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
                G.setState(cts.ETAT_MOVE_TANGENTE, -1) // tan1 tracée
                C.chartPH.tangente_point = C.chartPH.getEventIndicePoint(elt);
                C.chartPH.activePoints = C.chartPH.getData(elt);
            }

            // déplacement souris
        } else if (evt.type == "mousemove" && G.test('etat', cts.ETAT_MOVE_TANGENTE)) {
            if (selectedPoint == C.chartPH.tangente_point) {
                C.chartPH.movTangente(evt, C.chartPH.tangente_point, C.chartPH.activePoints, chartIndex);
            }
        }
    }
}

/********************************************************** */


export { setEvents, setEventsClick, reset }
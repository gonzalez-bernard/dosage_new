/************************************ 
 * dosage.events
 * 
**************************************/

import { cts } from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";
import * as e from "../modules/utils/errors.js"
import { getEltID } from "../modules/utils/html.js";
import { gDosages, gGraphMenu, gGraphs } from "../environnement/globals.js";
import { isObject } from "../modules/utils/type.js";
import { setPosFlacons, set_drag } from "./ui/flacon.js"
import { resetMesures } from "./dosage.datas.js"
import { setButtonState, setButtonClass, dspTabDosage } from "./dosage.ui.js"
import { vidage } from "./dosage.js"
import { dspInfo, dspContextInfo } from "../infos/infos.js";
import { dspTabEspeces, initDataInfo } from "../especes/especes.ui.js";
import { updateAppareil } from "./ui/appareil.js";
import { getCircularReplacer } from "../modules/utils/object.js";
import { Graphx } from "../dosage/graphx.js";


/** Définit events
 *
 * @use vidage
 * @file dosage.events
 */
function setEvents() {

    const G = gDosages.getCurrentDosage()
    const C = gGraphs.currentGraph

    const lab = G.lab
    if (!isObject(lab.canvas)) throw new TypeError((e.ERROR_OBJ))

    // Initie un listener d'événement de redimensionnement
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

        if (G.test('etat', cts.ETAT_PERPENDICULAIRE)) {
            G.setState(cts.ETAT_PERPENDICULAIRE, -1)
            C.chart.dspPerpendiculaire();
        }
    }

 
    /** bouton reset (réinitialise le dosage) */
    getEltID(ui.DOS_BT_RESET).on("click", function () {
        reset(false)
        G.setState(cts.ETAT_INDIC, -1)

        // désactive les boutons
        setButtonClass("")
        set_drag(lab.flacons, true)
    })

    /** bouton new_dosage (réinitialise lee espèces) */
    getEltID(ui.DOS_BT_NEW_DOSAGE).on("click", function () {

        reset(true)

        updateAppareil(lab.phmetre, lab.becher);

        // désactive les boutons
        setButtonClass("")

        // On bascule sur le premier onglet
        dspTabEspeces(true)
        dspTabDosage(false)
    });

    /** Vidange burette avec touche 'v' */
    lab.canvas.bind("keydown", function () {
        var key = lab.canvas.keyboard.getKeysDown();
        // @ts-ignore
        if (key.includes(86) && G.test('etat', cts.ETAT_ESPECES)) {
            vidage(lab, gDosages);
        }
    });

    /** fin du vidage */
    lab.canvas.bind("keyup", function () {
        lab.burette.leave("burette_o");
    });

    /** bouton affichage dérivée */
    getEltID(ui.DOS_BT_DERIVEE).on("click", function () {
        let C = gGraphs.currentGraph
        if (G.test('etat', cts.ETAT_DERIVEE)) {
            G.event = 0
            let idx = C.getChartByProp("id", "derivee")
            if (!idx) return;
            C.removeData(idx);
            setButtonClass(ui.DOS_BT_DERIVEE, 0)

        } else {
            C.dspDerivee()
            setButtonClass(ui.DOS_BT_DERIVEE, 1)

        }
        G.setState(cts.ETAT_MOVE_TANGENTE, 0)
        G.setState(cts.ETAT_DERIVEE, -1)
        localStorage.setItem("Graph", JSON.stringify(C, getCircularReplacer()))
    });

    /** boutons affichage tangentes */
    getEltID(ui.DOS_BT_TAN1).on("click", function () {
        _setTangente(1, cts.ETAT_TANGENTE_1, ui.DOS_BT_TAN1)
    });

    /** affichage tangente N°2 */
    getEltID(ui.DOS_BT_TAN2).on("click", function () {
        _setTangente(2, cts.ETAT_TANGENTE_2, ui.DOS_BT_TAN2)
    });

    /** affichage perpendiculaire */
    getEltID(ui.DOS_BT_PERP).on("click", function () {

        let C = gGraphs.currentGraph
        // si pas de perpendiculaire tracée
        if (G.test('etat', cts.ETAT_THEORIQUE)) {
            G.event = 0
            C.dspPerpendiculaire(1)
            C.indiceTangentes[2] = 0
            setButtonClass(ui.DOS_BT_PERP, 0)
            setButtonState()
            G.setState(cts.ETAT_PERPENDICULAIRE, -1)
        } else {
            // @ts-ignore
            C.dspPerpendiculaire(0)

        }
        localStorage.setItem("Graph", JSON.stringify(C, getCircularReplacer()))
    });

    /** affiche graphe théorique */
    getEltID(ui.DOS_BT_COTH).on("click", function () {
        let C = gGraphs.currentGraph
        // courbe théorique affichée
        if (G.test('etat', cts.ETAT_THEORIQUE)) {
            G.event = 0
            // efface courbe 
            C.dspCourbeTheorique(1)
            setButtonClass(ui.DOS_BT_COTH, 0)
            //setButtonState()
            //getEltID(ui.DOS_BT_DERIVEE).prop("disabled", true)
        } else {
            setButtonClass(ui.DOS_BT_COTH, -1)
            C.dspCourbeTheorique(0)
            getEltID(ui.DOS_BT_DERIVEE).removeAttr("disabled")
        }
        G.setState(cts.ETAT_MOVE_TANGENTE, 0)
        G.setState(cts.ETAT_THEORIQUE, -1)
    });

    /** affiche information */ 
    getEltID(ui.DOS_BT_dspINFO).on("click", null, { 'arg': G, fct: initDataInfo }, dspInfo);

    /** sortie du menu déroulant de liste des graphes */
    getEltID('menu').on('mouseleave',function(e){
        $('#fond').hide()
    })

    /** Enregistre la courbe en cours */
    getEltID(ui.DOS_BT_SAVE_GRAPH).on("click", function(){
        
        // modifie le flag 'save' du tableau 'charts'
        gGraphs.saveCurrentGraph()

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
    const G = gDosages.getCurrentDosage()
    const C = gGraphs.currentGraph


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

        if (all) {
            // On remet à zéro le graphe courant
            const idx = gGraphs.getChartIndexByID(gGraphs.activeChart)
            gGraphs.currentGraph = new Graphx(ui.DOS_CHART)
            // On efface les données dans le graphe mémorisé dans 'charts'
            gGraphs.charts = gGraphs.charts.slice(idx,0)
           
        } else {
            // réinitialise les graphes
            if (G.test('etat', cts.ETAT_GRAPH_PH)) {
                if (G.test('etat', cts.ETAT_TANGENTE_1))
                    C.removeData(C.getChartByProp('id', 'tan1'))
                if (G.test('etat', cts.ETAT_TANGENTE_2))
                    C.removeData(C.getChartByProp('id', 'tan2'))
                if (G.test('etat', cts.ETAT_PERPENDICULAIRE))
                    C.removeData(C.getChartByProp('id', 'perp'))
                if (G.test('etat', cts.ETAT_DERIVEE))
                    C.removeData(C.getChartByProp('id', 'derivee'))
                if (G.test('etat', cts.ETAT_THEORIQUE))
                    C.removeData(C.getChartByProp('id', 'theo'))
            }

            if (G.etat & (cts.ETAT_GRAPH_CD + cts.ETAT_GRAPH_PH + cts.ETAT_GRAPH_PT) && C) {
                C.clearData(0);
                C.data = []
            }
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
    const C = gGraphs.currentGraph

    // si tan déjà affichée on l'efface
    if (G.test('etat', ctsTangente)) {
        G.event = 0
        C.delTangente(idTangente);
        G.setState(ctsTangente, 0)

        // supprime la perpendiculaire si existe
        if (G.test('etat', cts.ETAT_PERPENDICULAIRE))
            // @ts-ignore
            _dspPerpendiculaire(C.graph)

        setButtonState()
    } else {
        G.event = idTangente
        dspContextInfo("dspTangente")
    }
    G.setState(cts.ETAT_MOVE_TANGENTE, 0)
    setButtonClass(idBtTangente, -1)
    localStorage.setItem("Graph", JSON.stringify(C, getCircularReplacer()))
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
 * @param {Record<string,unknown>[]} elt
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
    const C = gGraphs.currentGraph

    // On désactive tout
    if (elt.length != 0) {

        chartIndex = C.getEventIndexChart(elt);
        chartID = C.getIdChart(chartIndex).id
        selectedPoint = C.getEventIndicePoint(elt)


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
                if (C.indiceTangentes[idTangente - 1] != 0) {

                    // on ne fait rien si déjà tracée au même point
                    if (selectedPoint == C.indiceTangentes[idTangente - 1])
                        return false;

                    C.delTangente(idTangente);
                    C.indiceTangentes[idTangente - 1] = 0
                }

                // Affiche la tangente
                C.dspTangente(chartIndex, elt, idTangente);

                // enregistre l'indice du point de la tangente
                C.indiceTangentes[idTangente - 1] = selectedPoint;
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
                C.tangente_point = C.getEventIndicePoint(elt);
                C.activePoints = C.getData(elt);
            }

            // déplacement souris
        } else if (evt.type == "mousemove" && G.test('etat', cts.ETAT_MOVE_TANGENTE)) {
            if (selectedPoint == C.tangente_point) {
                C.movTangente(evt, C.tangente_point, C.activePoints, chartIndex);
            }
        }
    }
}

export { setEvents, setEventsClick, reset }
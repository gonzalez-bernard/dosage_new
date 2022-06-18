/************************************ 
 * gDosage.events
 * 
 * dbClic sur appareil pour activer : @link appareils.js:dbClicHandler()
 *      update appareil @link appareil.js:updateAppareil() :
 *          repositionne appareil @link appareil.js:_setAppareil()
 *          actualise type d'appareil (APPAREIL_TYPE)  
 *      désactive le dbClic (APPAREIL_ON = 0)
 *      active dosage (DOSAGE_ON = 1)
 *      Gestion du graphe @link dosage.graphe:graphManager() :  
 *          si activation (APPAREIL_ACTIF == 0) : 
 *              si première création (GRAPH_INIT == 0)
 *                  crée structure currentChart.chart (GRAPH_INIT = 1)
 *              appareil actif (APPAREIL_ACTIF = 1)
 *              définit type graphe (GRAPH_TYPE = type appareil)
 *              vide currentChart.data
 *              si courbe déjà existe dans charts et visible :
 *                  remplit données (currentChart.data) à partir de charts
 *              sinon :
 *                  crée le graphe @link dosage.graphs.js:addGraphCharts
 *          sinon désactivation :
 *              initialise idCurrentChart
 *              désactive visibilité @link Graphs.setVisibility
 *              annule type graphe (GRAPH_TYPE = 0)
 *              annule activation appareil (APPAREIL_ACTIF = 0)
 *          actualise icone de menu @link dosage.graph.js:_updGraphmenuIcon()
 *      
 *      affiche graphes @link dosage.graphs.js:displayGraphs()
 *      actualise affichage @link dosage.graphs.js:showGraph()
 *      actualise les boutons @link dosage.ui.js:setButtonVisible
 *      désactive le dbClic (APPAREIL_ON = 0)
 *      active dosage (DOSAGE_ON = 1)
 *      
 * touche V
 *      Fonction vidage @link dosage.js:vidage() :
 *          change etat burette
 *          active vidange burette @link Burette.vidange()
 *          actualise currentDosage et currentChart.data @link dosage.datas:updValues()
 *          actualise becher @link Becher.setColor()
 *          actualise texte @link Appareil.setText()
 *          active bouton @link dosage.ui:setButtonState()
 *          met à jour valeurs dans charts @link dosage.graphs:updGraphCharts()
 *      activation bouton sauvegarde @link dosage.ui.js:setButtonVisible()
 * 
 * enregistrement courbe :
 *      modifie flag save @link graphs:setChartSaveFlag()
 *      lance boite dialogue @link Dialog.display()
 *      si dialogue valable @link dosage.ui:saveDialog():
 *          ajoute item au menu @link dialog.ui:addGraphMenuItem()
 *          affiche menu @link Menu.displaymenu()
 *          ferme dialogue @link dosage.ui:closeDialog()
 *          désactive dosage (DOSAGE_ON = 0)
 * 
 * clic oeil_ouvert : @link dosage.graphs:toggleDisplayGraph()
 *      récupère appareil @link dosage.graphs:_getAppareil()
 *      Gestion du graphe @link dosage.graphe:graphManager() : 
 *          active visibilité @link Graphs.setVisibility()
 *          actualise type appareil GRAPH_TYPE  @link Dosage.setState()
 * 
 * clic oeil_fermé :
 *      si GRAPH_TYPE ==0 return
 *      update appareil @link appareil.js:updateAppareil() :
 *      désactive visibilité @link Graphs.setVisibility()
 *      actualise type appareil GRAPH_TYPE  @link Dosage.setState()
 * 
 * clic bouton nouveau dosage :
 *      modifie flags visible de toutes les courbes
 *      incrémente compteur (Dosage.id)
 *      réactive dosage (DOSAGE_ON = 1)
 *      réactive appareil (APPAREIL_ON = 1)
 *      désactive boutons @link setButtonClass()
 *      repositionne appareil
 *      bascule sur dosage
 * 
 * clic bouton reset :
 *      met à jour variables
 *      réactive dosage (DOSAGE_ON = 1)
 *      réinitialise chart
 *      réinitialise dosage courant
 *      repositionne appareil
 *      réactive appareil (APPAREIL_ON = 1)
 *      affche graphes
**************************************/

import { cts, etats } from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";
import * as e from "../modules/utils/errors.js"
import { getEltID } from "../modules/utils/html.js";
import { gDosage, gGraphMenu, gGraphs, gLab } from "../environnement/globals.js";
import { isObject } from "../modules/utils/type.js";
import { setPosFlacons, set_drag } from "./ui/flacon.js"
import { resetMesures } from "./dosage.datas.js"
import { setButtonState, setButtonClass, dspTabDosage } from "./dosage.ui.js"
import { vidage } from "./dosage.js"
import { dspInfo, dspContextInfo } from "../infos/infos.js";
import { dspTabEspeces, initDataInfo } from "../especes/interface.js";
import { displayGraphs, updGraphCharts, showGraph } from "./dosage.graph.js";
import { updateAppareil } from "../dosage/ui/appareil.js";



/** Définit events
 *
 * @use vidage
 * @file gDosage.events
 */
function setEvents() {

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
     * @file gDosage.events
     */
    function _resizeCanvas() {

        if (etats.PERPENDICULAIRE == 1) {
            etats.PERPENDICULAIRE = 0
            currentChart.hChart.dspPerpendiculaire();
        }
    }

    /** bouton reset (réinitialise le dosage) */
    getEltID(ui.DOS_BT_RESET).on("click", function () {

        resetLabo(false)
        resetGraph()
        gDosage.setState('APPAREIL_ON', 1)

        // désactive les boutons enregistrer
        setButtonClass(ui.DOS_BT_SAVE_GRAPH, 0)
        setButtonState()
        
    })

    /** bouton new_dosage (réinitialise lee espèces) */
    getEltID(ui.DOS_BT_NEW_DOSAGE).on("click", function () {

        resetLabo(true)
        resetGraph()

        // incrémente le compteur
        gDosage.id++;

        // réactive dosage et appareil
        gDosage.setState('DOSAGE_ON', 1)
        gDosage.setState('APPAREIL_ON', 1)
        gDosage.setState('APPAREIL_ACTIF', 0)

        // désactive les boutons
        setButtonClass("")

        updateAppareil(gLab.phmetre, gLab.becher);

        // On bascule sur le premier onglet
        dspTabEspeces(true)
        dspTabDosage(false)

    });

    /** Vidange burette avec touche 'v' */
    gLab.canvas.bind("keydown", function () {
        var key = gLab.canvas.keyboard.getKeysDown();
        if (!key.includes(86)) return
        if (gDosage.getState('ESPECES_INIT') == 0 || gDosage.getState('DOSAGE_ON') == 0) return

        // vidange
        vidage(gLab, gDosage);

        // Enregistre données dans charts
        updGraphCharts(gGraphs.idCurrentChart)

        // Active les boutons si volume titrant supérieur à 5 mL
        setButtonState(false)

        // affichage du menu
        //dspGraphMenu(true)
    })

    /** fin du vidage */
    gLab.canvas.bind("keyup", function () {
        gLab.burette.leave("burette_o");
    });

    /** bouton affichage dérivée */
    getEltID(ui.DOS_BT_DERIVEE).on("click", function () {

        let currentChart = gGraphs.currentChart

        // si dérivée affichée on la supprime
        if (gDosage.getState('DERIVEE_ON') == 1) {
            currentChart.dspDerivee(0)
            gDosage.setState('DERIVEE_ON', 0)
            setButtonClass(ui.DOS_BT_DERIVEE, 0)
        } else {
            currentChart.dspDerivee(1)
            gDosage.setState('DERIVEE_ON', 1)
            setButtonClass(ui.DOS_BT_DERIVEE, 1)
        }
        gDosage.setState('MOVE_TANGENTE', 0)

    });

    /** boutons affichage tangentes */
    getEltID(ui.DOS_BT_TAN1).on("click", function () {
        _setTangente(1, ui.DOS_BT_TAN1)
        setButtonClass(ui.DOS_BT_TAN1, -1)
    });

    /** affichage tangente N°2 */
    getEltID(ui.DOS_BT_TAN2).on("click", function () {
        _setTangente(2, ui.DOS_BT_TAN2)
        setButtonClass(ui.DOS_BT_TAN2, -1)
    });

    /** affichage perpendiculaire */
    getEltID(ui.DOS_BT_PERP).on("click", function () {

        let currentChart = gGraphs.currentChart
        // on vérifie la présence des deux tangentes
        if (gDosage.getState('TANGENTE') != 3)
            return false;

        // si perpendiculaire déjà tracée on l'efface
        if (gDosage.getState('PERPENDICULAIRE') == 1) {
            currentChart.dspPerpendiculaire(0)
            gDosage.setState('PERPENDICULAIRE', 0)
            setButtonClass(ui.DOS_BT_PERP, 0)
            setButtonState()

            return true;
        }

        // si pas de perpendiculaire tracée
        currentChart.dspPerpendiculaire(1)
        currentChart.indiceTangentes[2] = 0
        setButtonClass(ui.DOS_BT_PERP, 1)
        setButtonState()
        gDosage.setState('PERPENDICULAIRE', 1)
    });

    /** affiche graphe théorique */
    getEltID(ui.DOS_BT_COTH).on("click", function () {
        let currentChart = gGraphs.currentChart

        // si courbe théorique affichée
        if (gDosage.getState('THEORIQUE') == 1) {
            gDosage.event = 0
            // efface courbe 
            currentChart.dspCourbeTheorique(0)
            setButtonClass(ui.DOS_BT_COTH, 0)
            //setButtonState()
            //getEltID(ui.DOS_BT_DERIVEE).prop("disabled", true)
        } else {
            currentChart.dspCourbeTheorique(1)
            setButtonClass(ui.DOS_BT_COTH, - 1)
            getEltID(ui.DOS_BT_DERIVEE).removeAttr("disabled")
        }
        gDosage.setState('MOVE_TANGENTE', 0)
        gDosage.setState('THEORIQUE', -1)
    });

    /** affiche information */
    getEltID(ui.DOS_BT_dspINFO).on("click", null, { 'arg': gDosage, fct: initDataInfo }, dspInfo);

    /** sortie du menu déroulant de liste des graphes */
    getEltID('menu').on('mouseleave', function (e) {
        $('#fond').hide()
    })

    /** Enregistre la courbe en cours */
    getEltID(ui.DOS_BT_SAVE_GRAPH).on("click", function () {

        // modifie le flag 'save' du tableau 'charts'
        gGraphs.setChartSaveFlag(gGraphs.idCurrentChart, true)

        // affiche la boite de dialogue pour choisir le nom de la courbe
        gGraphMenu.displayDialog()

    })
}

/** Réinitialise
    * 
    * @param {boolean} all
    * On réinitialise la burette, le bécher, l'affichage des appareils et les flacons
    * Si 'all' on supprime le graphe courant sinon on conserve le graphe mais on efface les données
    * @file gDosage.events
    */
function resetLabo(all = false) {

    // réinitialise les constantes de dosage
    resetMesures(all);

    // réinitialise la burette
    gLab.burette.reset();

    // réinitialise le bécher
    gLab.becher.reset(gDosage.solution.vol);

    gLab.burette.canvas.redraw();

    // actualise l'affichage
    gLab.phmetre.setText(gDosage.sph);
    gLab.conductimetre.setText(gDosage.scond);
    gLab.potentiometre.setText(gDosage.spot)

    // positionne les flacons
    setPosFlacons(gLab.flacons)

    // supprime l'indicateur
    gDosage.indic = null

    // réactive drag flacons
    set_drag(gLab.flacons, true)

}

/** Réinitialise les graphes
 * - réinitialise les tableaux data
 * - supprime les courbes (tangente,...)
 * - désactive visibilité graphes
 * 
 */
function resetGraph() {

    // On remet à zéro le graphe courant
    if (gGraphs.idCurrentChart != '') {
        //gGraphs.charts.get(gGraphs.idCurrentChart).data = []
        gGraphs.currentChart.data = []
        gGraphs.currentChart.data_theorique = []
        gGraphs.currentChart.data_derive_theorique = []

        // supprime les courbes si présentes
        if (gDosage.getState('TANGENTE') == 1) {
            _setTangente(1, ui.DOS_BT_TAN1)
            setButtonClass(ui.DOS_BT_TAN1, 0)
        }
        if (gDosage.getState('TANGENTE') == 2) {
            _setTangente(1, ui.DOS_BT_TAN2)
            setButtonClass(ui.DOS_BT_TAN2, 0)
        }
        if (gDosage.getState('PERPENDICULAIRE') == 1) {
            gGraphs.currentChart.dspPerpendiculaire(0)
            gDosage.setState('PERPENDICULAIRE', 0)
            setButtonClass(ui.DOS_BT_PERP, 0)
        }
        if (gDosage.getState('THEORIQUE') == 1) {
            gGraphs.currentChart.dspCourbeTheorique(0)
            setButtonClass(ui.DOS_BT_COTH, 0)
        }

        // désactive visibilité de tous les graphes
        gGraphs.charts.forEach(e => { e.visible = false })

        //displayGraphs()
        //showGraph()
    }
}

/** action lors du clic sur boutons tangente
 * 
 * @param {number} idTangente N° de la tangente
 * @param {string} idBtTangente ID bouton
 * @use _dspPerpendiculaire, setButtonState, setButtonClass
 */
function _setTangente(idTangente, idBtTangente) {

    const currentChart = gGraphs.currentChart

    // si tan déjà affichée on l'efface
    if (gDosage.getState('TANGENTE') & idTangente) {
        gDosage.event = gDosage.getState('TANGENTE') ^ idTangente
        gDosage.setState('TANGENTE', gDosage.event)
        currentChart.delTangente(idTangente);

        currentChart.indiceTangentes[idTangente] = -1

        // supprime la perpendiculaire si existe
        if (gDosage.getState('PERPENDICULAIRE') == 1) {
            currentChart.dspPerpendiculaire(0)
            gDosage.setState("PERPENDICULAIRE", 0)

        }
        // activation des boutons
        setButtonState()
    } else {
        gDosage.event = idTangente
        dspContextInfo("dspTangente")
    }
    gDosage.setState('MOVE_TANGENTE', 0)

}


function setEventsClick(evt) {

    console.log(evt)

    // si type == clic
    switch (evt.type) {
        case "click":
            // paramètre du clic
            const idTangente = gDosage.event // défini par clic sur bouton tan1 ou tan2
            const selectPointIndex = evt.point.index
            const selectChartIndex = evt.point.series.index
            const selectChartName = evt.point.series.name

            // si courbe expérimentale
            if (selectChartIndex == 0) {

                // test si on est en mode affichage des tangentes
                if (gDosage.event != 1 && gDosage.event != 2)
                    return false

                // test si tangente déjà tracée
                if (gDosage.getState('TANGENTE') & idTangente) {

                    // on ne fait rien si déjà tracée au même point
                    if (selectPointIndex == gGraphs.currentChart.indiceTangentes[idTangente - 1])
                        return false;

                    gGraphs.currentChart.delTangente(idTangente);
                    gDosage.setState('TANGENTE', gDosage.getState('TANGENTE') ^ idTangente)
                    gGraphs.currentChart.indiceTangentes[idTangente - 1] = 0
                }

                // Affiche la tangente
                gGraphs.currentChart.dspTangente(evt.point, idTangente);

                // enregistre l'indice du point de la tangente
                gGraphs.currentChart.indiceTangentes[idTangente - 1] = selectPointIndex;
                gDosage.setState('TANGENTE', gDosage.getState('TANGENTE') ^ idTangente)

                setButtonState(false)

            }
            break
    }
}


export { setEvents, setEventsClick, resetLabo, resetGraph }



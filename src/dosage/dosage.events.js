/************************************ 
 * gDosage.events
 * 
 * dbClic sur appareil pour activer : @link appareils.js:dbClicHandler()
 *      update appareil @link appareil.js:updateAppareil() : 
 *          repositionne appareil @link appareil.js:_setAppareil()
 *          actualise type d'appareil (APPAREIL_TYPE)  et app.etat (0 ou 1)
 *      active ou désactive le dbClic en fonction de app.etat (APPAREIL_ON = 0)
 *      active ou désactive le dosage (DOSAGE_ON = 1)
 *      Gestion du graphe @link dosage.graph:graphManager() :  
 *          si activation (APPAREIL_TYPE != 0) :
 *              si graphe en cours = gDosage.id:
 *                  active visibilité  @link Graphs.setVisibility
 *              sinon:
 *                  si première création (GRAPH_INIT == 0)
 *                      crée structure currentChart.chart (GRAPH_INIT = 1)
 *                      ajoute graphe dans charts @link dosage.graphs.js:addGraphCharts
 *                      vide currentChart.data
 *                  sinon:
 *                      si courbe déjà existe dans charts :
 *                          active visibilité  @link Graphs.setVisibility
 *                          remplit données (currentChart.data) à partir de charts
 *                  fin si:
 *              actualise idCurrentChart
 *              affiche icone de menu @link dosage.graph.js:_updGraphmenuIcon()
 *          sinon désactivation :
 *              désactive visibilité @link Graphs.setVisibility
 *              cache icone de menu @link dosage.graph.js:_updGraphmenuIcon()
 *              idCurrentChart = ""
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

import { ETATS_GRAPH } from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";
import * as E from "../modules/utils/errors.js"
import { getEltID } from "../modules/utils/html.js";
import { gDosage, gGraphMenu, gGraphs, gLab } from "../environnement/globals.js";
import { isObject } from "../modules/utils/type.js";

import { setButtonState, setButtonClass, dspTabDosage } from "./dosage.ui.js"
import { vidage } from "./dosage.js"
import { resetMesures } from "./dosage.datas.js";
import { dspInfo, dspContextInfo } from "../infos/infos.js";
import { dspTabEspeces, initDataInfo } from "../especes/interface.js";
import { displayGraphs, showGraph, updGraphCharts, updGraphMenuIcon } from "./dosage.graph.js";
import { updateAppareil } from "../dosage/ui/appareil.js";
import { setTangente } from "./classes/graphs.js";



/** Définit events
 *
 * @use vidage
 * @file gDosage.events
 */
function setEvents() {

    const currentChart = gGraphs.currentChart

    if (!isObject(gLab.canvas)) E.debugError((E.ERROR_OBJ))

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

        if (gGraphs.getState('PERPENDICULAIRE') == 1) {
            gGraphs.setState('PERPENDICULAIRE',  0)
            currentChart.hChart.dspPerpendiculaire();
        }
    }

    /** bouton reset (réinitialise le dosage) */
    getEltID(ui.DOS_BT_RESET).on("click", function () {

        // réinitialise les constantes de dosage
        resetMesures(true);
        
        gLab.reset(gDosage)
        gGraphs.reset()
        gDosage.setState('APPAREIL_ON', 1)

        // désactive les boutons enregistrer
        setButtonClass(ui.DOS_BT_SAVE_GRAPH, 0)
        setButtonState()

    })

    /** bouton new_dosage (réinitialise lee espèces) */
    getEltID(ui.DOS_BT_NEW_DOSAGE).on("click", function () {

        // reinitialise appareil
        updateAppareil(gLab.phmetre, gLab.becher, 0);

        // resets
        gLab.reset(gDosage)
        gDosage.resetState(false)
        gGraphs.reset()

        // met à jour graphMenu
        updGraphMenuIcon()

        //displayGraphs()
        //showGraph()
        
        // incrémente le compteur
        gDosage.number++;

        // désactive les boutons
        setButtonClass("")

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
        if (gGraphs.getState('DERIVEE_ON') == 1) {
            currentChart.dspDerivee(0)
            gDosage.setState('DERIVEE_ON', 0)
            setButtonClass(ui.DOS_BT_DERIVEE, 0)
        } else {
            currentChart.dspDerivee(1)
            gDosage.setState('DERIVEE_ON', 1)
            setButtonClass(ui.DOS_BT_DERIVEE, 1)
        }
        gGraphs.setState('MOVE_TANGENTE', 0)

    });

    /** boutons affichage tangentes */
    getEltID(ui.DOS_BT_TAN1).on("click", function () {
        setTangente(1, ui.DOS_BT_TAN1)
        setButtonClass(ui.DOS_BT_TAN1, -1)
    });

    /** affichage tangente N°2 */
    getEltID(ui.DOS_BT_TAN2).on("click", function () {
        setTangente(2, ui.DOS_BT_TAN2)
        setButtonClass(ui.DOS_BT_TAN2, -1)
    });

    /** affichage perpendiculaire */
    getEltID(ui.DOS_BT_PERP).on("click", function () {

        let currentChart = gGraphs.currentChart
        // on vérifie la présence des deux tangentes
        if (gGraphs.getState('TANGENTE') != 3)
            return false;

        // si perpendiculaire déjà tracée on l'efface
        if (gGraphs.getState('PERPENDICULAIRE') == 1) {
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
        gGraphs.setState('PERPENDICULAIRE', 1)
    });

    /** affiche graphe théorique */
    getEltID(ui.DOS_BT_COTH).on("click", function () {
        let currentChart = gGraphs.currentChart

        // si courbe théorique affichée
        if (gGraphs.getState('THEORIQUE') == 1) {
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
        gGraphs.setState('MOVE_TANGENTE', 0)
        gGraphs.setState('THEORIQUE', -1)
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
                if (gGraphs.getState('TANGENTE') & idTangente) {

                    // on ne fait rien si déjà tracée au même point
                    if (selectPointIndex == gGraphs.currentChart.indiceTangentes[idTangente - 1])
                        return false;

                    gGraphs.currentChart.delTangente(idTangente);
                    gGraphs.setState('TANGENTE', gGraphs.getState('TANGENTE') ^ idTangente)
                    gGraphs.currentChart.indiceTangentes[idTangente - 1] = 0
                }

                // Affiche la tangente
                gGraphs.currentChart.dspTangente(evt.point, idTangente);

                // enregistre l'indice du point de la tangente
                gGraphs.currentChart.indiceTangentes[idTangente - 1] = selectPointIndex;
                gGraphs.setState('TANGENTE', gGraphs.getState('TANGENTE') ^ idTangente)

                setButtonState(false)

            }
            break
    }
}

export { setEvents, setEventsClick}



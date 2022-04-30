/** dosage.js
 *
 * @module dosage
 * @description
 * - Initialise les composants du dosage et affiche la page
 * - Gère le vidage de la burette et les couleurs
 */

import { cts } from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";

import * as labo from "./ui/interface.js";
import { gDosages, gGraphs, gLab } from "../environnement/globals.js";
import { ES_BT_dspINFO_OX, MNU_ESPECES, ESPECES, ES_BT_dspINFO_AC } from "./../especes/html_cts.js"

// utils
import * as e from "../modules/utils/errors.js";
import { uArray } from "../modules/utils/array.js";
import { mixColors } from "../modules/utils/color.js";
import { hasKey } from "../modules/utils/object.js";
import { isNumeric } from "../modules/utils/type.js";
import { getEltID, getElt } from "../modules/utils/html.js";
import { dspContextInfo, dspErrorMessage } from "../infos/infos.js";

// labo
import { set_drag } from "./ui/flacon.js";

import { setEvents, setEventsClick, reset } from "./dosage.events.js";
import { dspTabDosage, setButtonClass, setButtonState, initGraphMenu, dspGraphMenu } from "./dosage.ui.js";
import { dspTabEspeces } from "../especes/especes.ui.js";
import { resetMesures, setDosageValues, updValues, getDosage } from "./dosage.datas.js";
import { addGraphCharts, updGraphsCharts, showGraph, getOption } from "./dosage.graph.js";
import { html } from "./ui/html.js";
import { ES_MSG_DOSAGE_ERR, ES_MSG_INFO_ERR } from "../especes/lang_fr.js";

/**
 * @typedef {import("../../types/classes").Dosage} Dosage
 */

/** Met  à jour les informations du formulaire
 * 
 * - Lance la routine python et récupère les points des courbes 
 * - Initialise le dosage (Crée le graphe sans affichage)
 * @param {Dosage} dosage dosage en cours
 * @returns void
 * @use dosage.datas~getDosage, dosage.datas~setDosageValues
 * @use dosage.graph~manageGraph, dosage.graph~displayGraph
 * @use infos~dspErrorMessage
 * @use dialog.ui~initGraphMenu
 * @use especes.ui~dspTabEspeces, especes.ui~dspTabDosage
 * @use createLab
 * @file dosage.js
 */
async function initDosage(dosage) {

    try {

        // Lance calcul dosage
        getDosage(dosage.type).then(function (data) {

            // si dosage impossible, data est une constante on affiche message d'erreur
            if (data == cts.ERR_DOSAGE_IMPOSSIBLE) {
                const img = "../../static/resources/img/titration2.jpg"
                if (dosage.type == cts.TYPE_ACIDEBASE)
                    dspErrorMessage(ES_MSG_INFO_ERR, ES_MSG_DOSAGE_ERR, ES_BT_dspINFO_AC, { img: img })
                else
                    dspErrorMessage(ES_MSG_INFO_ERR, ES_MSG_DOSAGE_ERR, ES_BT_dspINFO_OX, { img: img })

                // Erreur système
            } else if (data == "Error_system") {
                console.log("Erreur systeme")
            }

            // Dosage réussi
            else {

                // initialise la constante dosage avec data
                setDosageValues(dosage, data)

                // modifie l'état
                dosage.setState('DATA_INIT', 1)

                // Affiche page
                if (dosage.getState('GRAPH_TYPE') == 0) {
                    getEltID(ui.DOSAGE).html(html);
                    getElt(".title").html(dosage.title)
                    //initGraphMenu()
                }

                /** Initialisation du dosage (dosage.js)  */
                createLab(dosage)

                // On bascule sur dosage
                dspTabEspeces(false)
                dspTabDosage(true)
                getEltID(MNU_ESPECES).removeClass('active')
                getEltID(ESPECES).removeClass('active show')

                // Affichage
                showGraph()

                reset(false)
                dosage.setState('INDIC_ON', 0)

                // désactive les boutons
                setButtonClass("")
                set_drag(gLab.flacons, true)
            }
        })
    }
    catch (err) {
        console.log(err)
    }
}

/** Initialise les composants du dosage
 *
 * Crée les instances des différents éléments du canvas et le canvas.
 * Définit les événements
 *
 * @access public
 * @param {Dosage} dosage en cours
 *
 * @use Becher#remplir, Becher#setColor
 * @use Appareil#dispose
 * @use initBecher~initBecher, initPhmetre~initPhmetre
 * @use Graphx#setOptions
 * @use dosage.graph~defGraphPH, dosage.graph~defGraphCD, dosage.graph~defGraphPT
 *
 * @requires Graphx
 * @returns {Promise} Objet contenant les éléments du dosage
 * @file dosage.js
 */
async function createLab(dosage) {


    // création canvas
    // @ts-ignore
    // eslint-disable-next-line no-undef
    await oCanvas.domReady(function () {

        //var gLab = {}

        // @ts-ignore
        // eslint-disable-next-line no-undef
        gLab.setCanvas("#" + ui.DOS_CANVAS, "./" + cts.FILE_BACKGROUND_LABO, labo)
        /*
        gLab.canvas = oCanvas.create({
            canvas: "#" + ui.DOS_CANVAS,
            fps: 40,
            background: "./" + cts.FILE_BACKGROUND_LABO,
        });
        gLab.canvas.width = labo.CANVAS.width;
        gLab.canvas.height = labo.CANVAS.height;
        */
        // fond écran
        gLab.setBackground("image(" + cts.FILE_BACKGROUND_LABO + ")")
        //gLab.canvas.background.set("image(" + cts.FILE_BACKGROUND_LABO + ")");

        // création des éléments
        gLab.initBecher(dosage)
        gLab.initTooltip();
        gLab.initBurette(dosage);
        gLab.initFlacon(dosage);
        gLab.initPhmetre(dosage);
        gLab.initConductimetre(dosage);
        gLab.initPotentiometre(dosage);

    });

    //if (isObject(dosage.lab)) {

    // Modifie affichage pHmetre et graph
    gLab.phmetre.setText(dosage.sph);

    //DS.idCurrentDosage += 1

    // définition des événements
    setEvents();

    // Affiche info
    dspContextInfo("init")

    initGraphMenu()
    /*
    } else {
        getEltID(ui.DOS_DIV_GRAPH).hide()
    }
    */
}

/** fonction de vidage burette
 *
 * met à jour la burette et le bécher
 * met à jour le graphe et l'affichage du texte des phmetre et conductimètre
 *
 * @param {import("../../types/classes.js").Lab} lab
 * @param {Dosage} dosage
 * @returns void
 * @use dosage.datas~updValues
 * @use burette#vidange, becher#setColor
 * @use potentiometre#setText, conductimetre#setText, phmetre#setText
 * @use Graphx#changeData
 * @file dosage.js
 */
function vidage(lab, dosage) {

    // Vérifie que l'on ne ravaille pas sur une courbe enregistrée
    // Si un id des axes y dans scales correspond avec un ID d'une courbe sauvée on inactive la vidange
    let valid = true
    const courbes = gGraphs.currentChart.chart.scales
    gGraphs.charts.forEach(elt => {
        if ("y_" + elt.id in courbes && elt.save == true)
            valid = false
    })

    if (!valid) return

    // change état
    lab.burette.vidage = lab.burette.vidage == 0 ? 1 : 0;

    // vidage de la burette
    lab.burette.vidange(lab.burette.debit, lab.becher);

    // Mise à jour des valeurs
    if (!updValues(lab.burette, dosage)) return false;

    // Modifie la couleur du bécher en fonction du dosage
    lab.becher.setColor(getColor(0));

    switch (dosage.getState('APPAREIL_ON')) {
        case 1:
            lab.phmetre.setText(dosage.sph);
            break
        case 2:
            lab.potentiometre.setText(dosage.spot);
            break
        case 3:
            lab.conductimetre.setText(dosage.scond);
    }

    // Active les boutons si volume titrant supérieur à 5 mL
    setButtonState(false)
    dspGraphMenu(true)

    // si le tableau charts ne contient pas la courbe (suppression par le menu) il faut le réinitialiser
    const C = gGraphs.currentChart
    const indexs = gGraphs.getChartIndexByID(gGraphs.idCurrentChart)
    if (indexs.vrt == -1) {
        const options = getOption(-1, C.type - 1, "y_" + gGraphs.idCurrentChart)
        const arg = addGraphCharts(C.chart.data.datasets[indexs.dsp], options)
        indexs.vrt = arg.indice
        updGraphsCharts(indexs)
    }
    //actualise le graphe
    //const index = gGraphs.getChartIndexByID(gGraphs.idCurrentChart)
    //C.changeData(C.data, index);    
}

/** Récupère la couleur du bécher ou de la burette
 *
 * @param {number} container: type du récipient 0 : bécher , 1 : burette
 * @returns {string} couleur
 * @file dosage.js
 */
function getColor(container) {
    const G = gDosages.getCurrentDosage()
    if (!isNumeric(container)) throw new TypeError(e.ERROR_NUM);

    function _getColorPH() {
        let resp = ""

        const G = gDosages.getCurrentDosage()
        const indic = labo.INDICATEURS[G.indic];

        // Modification couleur du bécher
        if (G.indic == null) {
            resp = cts.COLOR_INIT;
        } else {
            // ajuste la couleur en fonction du pH et de l'indicateur coloré
            if (G.titre.vol > 0) {

                const col = parseFloat(indic.values[0]);
                if (G.ph < col - 0.5)
                    resp = indic.values[1];
                else if (G.ph > col + 0.5)
                    resp = indic.values[3];
                else
                    resp = indic.values[2];
            }
        }
        return resp
    }

    function _getColorOX() {

        // suivant le type de dosage (simple, retour ou ) on cherche la concentration du titré ou celle du réactif
        // on récupère l'indice du tableau 'vols' avec le volume théorique le plus proche du volume en cours
        const G = gDosages.getCurrentDosage()
        var ind = new uArray(G.vols).getArrayNearIndex(G.titrant.vol);
        var idTitle = [0, 0, 3, 7]; // indice de l'espèce titrée

        // récupère la concentration
        var concentration = G.concs[ind][idTitle[G.typeDetail]];

        // changement de couleur - On commence à modifier si la concentration est inférieure à 1/100 de la concentration initiale en mixant les couleurs.
        var indic = labo.INDICATEURS[G.indic];
        let firstColor, endColor;
        let currentColor = null;

        if (G.indic == null || G.indic == undefined) {
            firstColor = G.titre.color;
            endColor = G.colProduit.endColor;
            if (hasKey(G.colProduit, "currentColor")) currentColor = G.colProduit.currentColor;
        } else {
            firstColor = indic.values[1];
            currentColor = indic.values[2];
            endColor = indic.values[3];
        }

        if (concentration > 0) {
            let initialConcentration = G.concs[0][idTitle[G.typeDetail]];
            if (concentration < initialConcentration / 20) {
                var proportion = 1 - (20 * concentration) / initialConcentration;

                if (currentColor)
                    return mixColors(currentColor, endColor, 1 - proportion, proportion);
                else return mixColors(G.titre.color, endColor, 1 - proportion, proportion);
            } else {
                if (currentColor) return currentColor;
                else return firstColor;
            }
        } else {
            return endColor;
        }
    }

    let resp = ""
    if (container == 0) {

        // si dosage pH
        if (G.type == cts.TYPE_ACIDEBASE)
            resp = _getColorPH();
        // dosage oxydo
        else if (G.type == cts.TYPE_OXYDO)
            resp = _getColorOX();
    }

    return resp
}

export { createLab, updValues, vidage, getColor, resetMesures, setDosageValues, setEvents, setEventsClick, initDosage };
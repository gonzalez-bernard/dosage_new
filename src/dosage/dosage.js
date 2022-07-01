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
import { gDosage, gGraphMenu, gGraphs, gLab } from "../environnement/globals.js";
import { ES_BT_dspINFO_OX, MNU_ESPECES, ESPECES, ES_BT_dspINFO_AC } from "./../especes/html_cts.js"

// utils
import * as E from "../modules/utils/errors.js";
import { uArray } from "../modules/utils/array.js";
import { mixColors } from "../modules/utils/color.js";
import { hasKey} from "../modules/utils/object.js";
import { isNumeric } from "../modules/utils/type.js";
import { getEltID, getElt } from "../modules/utils/html.js";
import { dspContextInfo, dspErrorMessage } from "../infos/infos.js";

// labo
import { setEvents, setEventsClick } from "./dosage.events.js";
import { dspTabDosage, createGraphMenu } from "./dosage.ui.js";
import { dspTabEspeces } from "../especes/especes.ui.js";
import { resetMesures, setDosageValues, updValues, getDosage } from "./dosage.datas.js";
import { showGraph } from "./dosage.graph.js";
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

                // initialise la constante dosage avec data issu de Python (dosage.data)
                setDosageValues(dosage, data)

                // Affiche page
                if (dosage.getState('LAB_INIT') == 0) {
                    getEltID(ui.DOSAGE).html(html);
                    getElt(".title").html(dosage.title)

                    // Initialisation du dosage (dosage.js), crée le graphMenu  
                    createLab(dosage)
                } else {
                    gGraphMenu.displayMenu(true)
                }

                gDosage.setState("DOSAGE_INIT",1)

                dosage.setID()

                // On bascule sur dosage
                dspTabEspeces(false)
                dspTabDosage(true)
                getEltID(MNU_ESPECES).removeClass('active')
                getEltID(ESPECES).removeClass('active show')

                // Affichage
                showGraph()

                // initialise les états
                gDosage.resetState()
                gGraphs.resetState()

                // désactive les boutons
                //setButtonClass("")
                gLab.setDragFlacons(true)
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

        // fond écran
        gLab.setBackground("image(" + cts.FILE_BACKGROUND_LABO + ")")

        // création des éléments
        gLab.initBecher(dosage)
        gLab.initTooltip();
        gLab.initBurette(dosage);
        gLab.initFlacon(dosage);
        gLab.initPhmetre(dosage);
        gLab.initConductimetre(dosage);
        gLab.initPotentiometre(dosage);

    });

    // Modifie affichage pHmetre et graph
    gLab.phmetre.setText(dosage.sph);

    //DS.idCurrentDosage += 1

    // définition des événements
    setEvents();

    // Affiche info
    dspContextInfo("init")

    // initialise menu des graphes (GRAPMENU_INIT = 1)
    createGraphMenu()

    dosage.setState('LAB_INIT', 1)
    gGraphs.setState('GRAPHMENU_INIT', 1)
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

    // Vérifie que l'on ne travaille pas sur une courbe enregistrée
    // Si un id des axes y dans scales correspond avec un ID d'une courbe sauvée on inactive la vidange
    if (gGraphs.charts.get(gGraphs.idCurrentChart).save) return

    // change état
    lab.burette.vidage = 1 - lab.burette.vidage;

    // vidage de la burette
    lab.burette.vidange(lab.burette.debit, lab.becher);

    // Mise à jour des valeurs
    if (!updValues(lab.burette, dosage)) return false;

    // Modifie la couleur du bécher en fonction du dosage
    lab.becher.setColor(getColor(0));

    switch (dosage.getState('APPAREIL_TYPE')) {
        case 1:
            lab.phmetre.setText(dosage.sph);
            break
        case 2:
            lab.conductimetre.setText(dosage.scond);
            break
        case 3:
            lab.potentiometre.setText(dosage.spot);
    }
}

/** Récupère la couleur du bécher ou de la burette
 *
 * @param {number} container: type du récipient 0 : bécher , 1 : burette
 * @returns {string} couleur
 * @file dosage.js
 */
function getColor(container) {
    if (!isNumeric(container)) E.debugError(E.ERROR_NUM);

    function _getColorPH() {
        let resp = ""

        const indic = labo.INDICATEURS[gDosage.indic];

        // Modification couleur du bécher
        if (gDosage.indic == null) {
            resp = cts.COLOR_INIT;
        } else {
            // ajuste la couleur en fonction du pH et de l'indicateur coloré
            if (gDosage.titre.vol > 0) {

                const col = parseFloat(indic.values[0]);
                if (gDosage.ph < col - 0.5)
                    resp = indic.values[1];
                else if (gDosage.ph > col + 0.5)
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
        var ind = new uArray(gDosage.vols).getArrayNearIndex(gDosage.titrant.vol);
        var idTitle = [0, 0, 3, 7]; // indice de l'espèce titrée

        // récupère la concentration
        var concentration = gDosage.concs[ind][idTitle[gDosage.typeDetail]];

        // changement de couleur - On commence à modifier si la concentration est inférieure à 1/100 de la concentration initiale en mixant les couleurs.
        var indic = labo.INDICATEURS[gDosage.indic];
        let firstColor, endColor;
        let currentColor = null;

        if (gDosage.indic == null || gDosage.indic == undefined) {
            firstColor = gDosage.titre.color;
            endColor = gDosage.colProduit.endColor;
            if (hasKey(gDosage.colProduit, "currentColor")) currentColor = gDosage.colProduit.currentColor;
        } else {
            firstColor = indic.values[1];
            currentColor = indic.values[2];
            endColor = indic.values[3];
        }

        if (concentration > 0) {
            let initialConcentration = gDosage.concs[0][idTitle[gDosage.typeDetail]];
            if (concentration < initialConcentration / 20) {
                var proportion = 1 - (20 * concentration) / initialConcentration;

                if (currentColor)
                    return mixColors(currentColor, endColor, 1 - proportion, proportion);
                else return mixColors(gDosage.titre.color, endColor, 1 - proportion, proportion);
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
        if (gDosage.type == cts.TYPE_ACIDEBASE)
            resp = _getColorPH();
        // dosage oxydo
        else if (gDosage.type == cts.TYPE_OXYDO)
            resp = _getColorOX();
    }

    return resp
}




export { createLab, updValues, vidage, getColor, resetMesures, setDosageValues, setEvents, setEventsClick, initDosage};
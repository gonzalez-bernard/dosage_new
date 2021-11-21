/** dosage.js
 *
 * @module dosage
 * @description
 * - Initialise les composants du dosage et affiche la page
 * - Gère le vidage de la burette et les couleurs
 */

import * as cts from "../environnement/constantes.js";
import * as ui from "./ui/html_cts.js";
import * as e from "../modules/utils/errors.js";
import {G} from "../environnement/globals.js";

import * as labo from "./ui/interface.js";
import {uArray} from "../modules/utils/array.js";
import {mixColors} from "../modules/utils/color.js";
import {hasKey} from "../modules/utils/object.js";
import {isNumeric} from "../modules/utils/type.js";
import {getEltID} from "../modules/utils/html.js";

import {dspInfo} from "../infos/infos.js";

import {initBecher} from "./ui/initBecher.js";
import {initTooltip} from "./ui/initTooltip.js";
import {initBurette} from "./ui/initBurette.js";
import {initFlacon} from "./ui/initFlacon.js";
import {initPhmetre} from "./ui/initPhmetre.js";
import {initConductimetre} from "./ui/initConductimetre.js";
import {initPotentiometre} from "./ui/initPotentiometre.js";
import {ERR_DOSAGE} from "./ui/lang_fr.js";
import {ES_BTCLOSE_LABEL, ES_MSG_INFO_ERR} from "../especes/lang_fr.js";

import {ES_DIV_INFO} from "./../especes/html_cts.js";
import {FILE_BACKGROUND_LABO} from "./../environnement/constantes.js";

import {setEvents, setEventsClick} from "./dosage.events.js";
import {setClassMenu} from "./dosage.ui.js";
import {resetMesures, setDosageValues, updValues} from "./dosage.datas.js";
import {FLACON} from "./ui/interface.js";
//var oCanvas = require("../../node_modules/ocanvas/build/dist/latest/ocanvas.js")

//var burette, becher, phmetre, tooltip, conductimetre, canvas, flacons, potentiometre
//var labo = {}

/** Initialise les composants du dosage
 *
 * Crée les instances des différents éléments du canvas et le canvas.
 * Définit les événements
 *
 * @access public
 * @param {Dosage} G objet global
 * @param {tLab?} lab objet contenant les éléments du labo
 *
 * @use Becher#remplir, Becher#setColor
 * @use Appareil#dispose
 * @use initBecher=>initBecher, initPhmetre=>initPhmetre
 * @use Graphx#setOptions
 * @use dosage.graph=>defGraphPH, dosage.graph=>defGraphCD, dosage.graph=>defGraphPT
 *
 * @requires Graphx
 * @returns {tLab} Objet contenant les éléments du dosage
 * @file dosage.js
 */
function createLab(G, lab = undefined) {
    // si canvas existe car un précédent dosage a été effectué
    if (lab != undefined) {
        lab.becher.remplir(0, G.solution.vol, 0);
        lab.becher.setColor(getColor(0));
        lab.phmetre.dispose(lab.becher, lab.phmetre.offsetX, lab.phmetre.offsetY);
        lab.conductimetre.dispose(lab.becher, lab.conductimetre.offsetX, lab.conductimetre.offsetY);
        lab.potentiometre.dispose(lab.becher, lab.potentiometre.offsetX, lab.potentiometre.offsetY);

        // met à jour les graphes
        G.charts.chartPH.setOptions(G);
        G.charts.chartCD.setOptions(G);
        G.charts.chartPT.setOptions(G);
    } else {
        // création canvas

        
        
        // @ts-ignore
        lab = {};
        oCanvas.domReady(function () {

            lab.canvas = oCanvas.create({
                canvas: "#" + ui.DOS_CANVAS,
                fps: 40,
                background: "./" + FILE_BACKGROUND_LABO,
            });
            lab.canvas.width = labo.CANVAS.width;
            lab.canvas.height = labo.CANVAS.height;

            // fond écran
            lab.canvas.background.set("image(" + FILE_BACKGROUND_LABO + ")");

            // création des éléments
            lab.becher = initBecher(lab.canvas, labo.BECHER);
            lab.tooltip = initTooltip(lab.canvas);
            lab.flacons = initFlacon(lab.canvas, lab.tooltip, lab.becher, FLACON);
            lab.burette = initBurette(lab.canvas, lab, G);
            lab.phmetre = initPhmetre(lab, G);
            lab.conductimetre = initConductimetre(lab, G);
            lab.potentiometre = initPotentiometre(lab, G);
        });
    }
    return lab;
}

/********************************************************** */

/** fonction de vidage burette
 *
 * met à jour la burette et le bécher
 * met à jour le graphe et l'affichage du texte des phmetre et conductimètre
 *
 * @param {tLab} lab
 * @param {Dosage} G
 * @returns void
 * @use dosage.datas=>updValues
 * @use burette#vidange, becher#setColor
 * @use potentiometre#setText, conductimetre#setText, phmetre#setText
 * @use Graphx#changeData
 * @public
 * @file dosage.js
 */
function vidage(lab, G) {
    // change état
    lab.burette.vidage = lab.burette.vidage == 0 ? 1 : 0;

    // vidage de la burette
    lab.burette.vidange(lab.burette.debit, lab.becher);

    // Mise à jour des valeurs
    if (!updValues(lab.burette)) return false;

    // Modifie la couleur du bécher en fonction du dosage
    lab.becher.setColor(getColor(0));

    // si dosage pH
    // définit le texte et actualise le graphe
    if (G.test("etat", cts.ETAT_PHMETRE)) {
        lab.phmetre.setText(G.sph);
        G.charts.chartPH.changeData(G.charts.chartPH.data);

        // Boutons
        // Active les boutons si volume titrant supérieur à 10 mL
        if (G.titrant.vol > 5) {
            getEltID(ui.DOS_BT_DERIVEE).removeAttr("disabled");
            getEltID(ui.DOS_BT_TAN1).removeAttr("disabled");
            getEltID(ui.DOS_BT_COTH).removeAttr("disabled");
        }
    }
    // dosage ox
    else if (G.test("etat", cts.ETAT_COND)) {
        lab.conductimetre.setText(G.scond);
        G.charts.chartCD.changeData(G.charts.chartCD.data);
    }

    // dosage potentiomètrique
    else if (G.test("etat", cts.ETAT_POT)) {
        lab.potentiometre.setText(G.spot);
        G.charts.chartPT.changeData(G.charts.chartPT.data);
    }
}

/********************************************************** */

/** Récupère la couleur du bécher ou de la burette
 *
 * @param {number} container: type du récipient 0 : bécher , 1 : burette
 * @returns {string} couleur
 * @public
 * @file dosage.js
 */
function getColor(container) {
    if (!isNumeric(container)) throw new TypeError(e.ERROR_NUM);

    function _getColorPH() {
        // Modification couleur du bécher
        if (G.indic == null) {
            return cts.COLOR_INIT;
        }
        var indic = labo.INDICATEURS[G.indic];

        // ajuste la couleur en fonction du pH et de l'indicateur coloré
        if (G.titre.vol > 0) {
            const col = parseFloat(indic.values[0]);
            if (G.ph < col - 0.5) return indic.values[1];
            else if (G.ph > col + 0.5) return indic.values[3];
            else return indic.values[2];
        }
    }

    function _getColorOX() {
        // suivant le type de dosage (simple, retour ou ) on cherche la concentration du titré ou celle du réactif
        // on récupère l'indice du tableau 'vols' avec le volume théorique le plus proche du volume en cours

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

    if (container == 0) {
        // si dosage pH
        if (G.type == cts.TYPE_ACIDEBASE) return _getColorPH();
        // dosage oxydo
        else if (G.type == cts.TYPE_OXYDO) return _getColorOX();
    }
}

/********************************************************** */

/** Affiche le message d'erreur
 *
 * @param {string} idButton ID du bouton
 * @returns void
 * @public
 * @file dosage.js
 * @external dosage_ox~initDosageOX
 */
function dspMessage(idButton) {
    const data = {
        idModal: "idModal",
        idContainer: ES_DIV_INFO,
        labelBtClose: ES_BTCLOSE_LABEL,
        title: ES_MSG_INFO_ERR,
        actionBtClose: setClassMenu,
        idBtClose: idButton,
        msg: ERR_DOSAGE,
    };
    dspInfo(data);
}

export {
    createLab,
    updValues,
    vidage,
    getColor,
    setClassMenu,
    dspMessage,
    resetMesures,
    setDosageValues,
    setEvents,
    setEventsClick,
};

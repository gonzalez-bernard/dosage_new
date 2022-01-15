/** initConductimetre.js 
 * 
 * @module dosage/ui/initConductimetre
 * @description
 * - Crée le conductimetre et définit les events
 * - Positionne celui-ci et actualise l'affichage
 * ***
 * ***export initConductimetre***
*/

import * as cConductimetre from "./classes/conductimetre.js";
import {cts} from"../../environnement/constantes.js";
import * as txt from "./lang_fr.js";
import * as e from "../../modules/utils/errors.js";
import { isObject } from "../../modules/utils/type.js";
import { CONDUCTIMETRE } from "./interface.js";
import { displayGraph, manageGraph } from "../dosage.graph.js"
import { updateAppareil } from "./initAppareil.js";
import { setButtonState, setButtonVisible } from "../dosage.ui.js";

/**
 * @typedef { import ("../../../types/types").tLab} tLab
 * @typedef { import ( '../../../types/classes' ).Dosage } Dosage  
 * @typedef { import ( '../../../types/classes' ).Conductimetre } Conductimetre  
 */

/** Crée le conductimètre
 *
 * Définit les events
 * @param {tLab} lab structure labo
 * @param {Dosage} G
 * @returns {Conductimetre} Conductimetre
 * @use updGraph, displayGraph
 * @public
 * @file initConductimetre
 */
function initConductimetre(lab, G) {
    if (!isObject(lab.canvas) || !isObject(lab.tooltip) || !isObject(lab.becher)) throw new TypeError(e.ERROR_OBJ)

    // Crée conductimetre
    var conductimetre = new cConductimetre.Conductimetre(CONDUCTIMETRE, lab.canvas, cts.ETAT_COND, "mS");
    lab.canvas.addChild(conductimetre.fond);

    // survol conductimetre
    conductimetre.fond.bind("mouseenter", function () {
        if (G.test('mesure', 2)) {
            lab.canvas.mouse.cursor("pointer");
            lab.tooltip.dspText(txt.DO_CONDUCTIMETRE);
        } else {
            lab.canvas.mouse.cursor("not-allowed");
        }
    });

    // Quitte survol conductimetre
    conductimetre.fond.bind("mouseleave", function () {
        lab.canvas.mouse.cursor("default");
        lab.tooltip.dspText();
    });

    /* Installe le conductimetre ou le positionne à sa place.
    Gère la création et l'affichage de la courbe */
    conductimetre.fond.bind("dblclick", function () {
        if (updateAppareil(conductimetre, lab.becher)) {
            // met à jour le graphe
            manageGraph(cts.ETAT_COND)
            displayGraph()
            G.setState(cts.ETAT_GRAPH_CD, -1)
            // actualise les boutons
            setButtonState(false)
            setButtonVisible(false)
        }
    });

    return conductimetre;
}

export { initConductimetre };
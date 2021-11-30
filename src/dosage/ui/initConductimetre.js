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
import * as cts from "../../environnement/constantes.js";
import * as txt from "./lang_fr.js";
import * as e from "../../modules/utils/errors.js";
//import { G } from "../../environnement/globals.js";
import { isObject } from "../../modules/utils/type.js";
import { CONDUCTIMETRE } from "./interface.js";
import { displayGraph, updateGraph } from "../dosage.graph.js"

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
        if (G.test('etat', cts.ETAT_PHMETRE) || G.test('etat', cts.ETAT_POT))
            return
        if (G.test('mesure', 2)) {
            if (!(G.test('etat', cts.ETAT_ESPECES))) return false;

            // change l'état de branchement du conductimètre
            G.setState(cts.ETAT_COND, -1)
        
            // Positionne le conductimètre
            conductimetre.dispose(lab.becher);
            conductimetre.setText(G.scond);
            updateGraph(lab.canvas)
            displayGraph(lab.canvas)
        }
    });

    return conductimetre;
}

export { initConductimetre };
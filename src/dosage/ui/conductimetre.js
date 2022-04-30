import {Appareil} from "./appareil.js"
import {cts} from"../../environnement/constantes.js";
import * as txt from "./lang_fr.js";
import * as e from "../../modules/utils/errors.js";
import { isObject } from "../../modules/utils/type.js";
import { CONDUCTIMETRE } from "./interface.js";
import { showGraph, manageGraph, displayGraphs} from "../dosage.graph.js"
import { updateAppareil } from "./appareil.js";
import { setButtonState, setButtonVisible } from "../dosage.ui.js";

/**
 * @typedef {import ('../../../types/classes').Canvas} Canvas
 * @typedef {import ('../../../types/types').tAPPAREIL} tAPPAREIL
 * @typedef { import ("../../../types/classes").Lab} Lab
 * @typedef { import ( '../../../types/classes' ).Dosage } Dosage  
 */


/**  Création conductimètre
 *
 * @class Conductimetre
 * 
*/
class Conductimetre extends Appareil{

  /**
   * Construit objet conductimetre
   * @param {tAPPAREIL} app structure
   * @param {Canvas} canvas 
   * @param {string} unite 
   */
  constructor(app, canvas, unite){
    super(app, canvas,  unite)

    this.fond.addChild(this.value)
  }
}


/** initConductimetre.js 
 * 
 * @module dosage/ui/initConductimetre
 * @description
 * - Crée le conductimetre et définit les events
 * - Positionne celui-ci et actualise l'affichage
 * ***
 * ***export initConductimetre***
*/

/** Crée le conductimètre
 *
 * Définit les events
 * @param {Lab} lab structure labo
 * @param {Dosage} G
 * @returns {Conductimetre} Conductimetre
 * @use updGraph, displayGraph
 * @file Conductimetre
 */
function initConductimetre(G, lab) {
    if (!isObject(lab.canvas) || !isObject(lab.tooltip) || !isObject(lab.becher)) throw new TypeError(e.ERROR_OBJ)

    // Crée conductimetre
    var conductimetre = new Conductimetre(CONDUCTIMETRE, lab.canvas, "mS");
    lab.canvas.addChild(conductimetre.fond);

    // survol conductimetre
    conductimetre.fond.bind("mouseenter", function () {
        if (G.mesure & 2) {
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
            
            // Change l'état d'affichage du graphe
            G.setState('GRAPH_TYPE', -1, G.getState('APPAREIL_ON'))

            // met à jour le graphe
            manageGraph(G.getState('GRAPH_TYPE'), -1)
            displayGraphs()
            showGraph()
            
            // actualise les boutons
            setButtonState(false)
            setButtonVisible(false)
        }
    });

    return conductimetre;
}

export { initConductimetre };
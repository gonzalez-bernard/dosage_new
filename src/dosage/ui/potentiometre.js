/** initPotentiometre.js 
 * @module dosage/ui/initPotentiometre
 * @description
 * - Crée l'objet Potentiometre
 * - Définit les events
 * ***
 * ***export initPotentiometre***
*/

import { Appareil, dbClicHandler } from "./appareil.js"
import { POTENTIOMETRE } from "./interface.js";
import { cts } from "../../environnement/constantes.js";
import * as txt from "./lang_fr.js";
import * as E from "../../modules/utils/errors.js";
import { isObject } from "../../modules/utils/type.js";
import { showGraph, graphManager, displayGraphs } from "../dosage.graph.js"
import { updateAppareil } from "./appareil.js";
import { setButtonState, setButtonVisible } from "../dosage.ui.js";

/**
 * @typedef {import('../../../types/classes').Lab} Lab
 * @typedef {import('../../../types/classes').Dosage} Dosage
 * @typedef {import('../../../types/classes').Canvas} Canvas 
 * @typedef {import('../../../types/types').tAPPAREIL} tAPPAREIL 
 * @typedef {import('../../../types/interfaces').iCanvasText} iCanvasText
 * 
 */

/**  Création potentiomètre
 *
 * @class potentiometre
 * 
*/
class Potentiometre extends Appareil {

  /**
   * 
   * @param {tAPPAREIL} app 
   * @param {Canvas} canvas 
   * @param {string} unite 
   */
  constructor(app, canvas, unite) {
    super(app, canvas, unite, 2)

    /** @type {iCanvasText} */
    this.value = canvas.display.text({
      x: app.w / 2 + 10,
      y: app.h / 2 - 23,
      size: app.w / 8,
      text: app.value,
      fill: "#0",
      origin: { x: "center", y: "center" }
    })

    this.fond.addChild(this.value)
  }
}


/** Crée le potentiomètre
 *
 * Définit les events
 * @param {Lab} lab
 * @param {Dosage} G
 * @returns {Potentiometre} Conductimetre
 * @use updGraph, displayGraph
 * @public
 * @file initPotentiometre.js
 */
function initPotentiometre(G, lab) {
  if (!isObject(lab.canvas) || !isObject(lab.tooltip) || !isObject(lab.becher)) E.debugError(E.ERROR_OBJ)

  // Crée potentiometre
  var potentiometre = new Potentiometre(POTENTIOMETRE, lab.canvas, "V");
  lab.canvas.addChild(potentiometre.fond);

  // survol potentiometre
  potentiometre.fond.bind("mouseenter", function () {
    if (G.type == cts.TYPE_OXYDO && (G.mesure & 4)) {
      lab.canvas.mouse.cursor("pointer");
      lab.tooltip.dspText(txt.DO_POTENTIOMETRE);
    } else
      lab.canvas.mouse.cursor("not-allowed");
  });

  // Quitte survol potentiometre
  potentiometre.fond.bind("mouseleave", function () {
    lab.canvas.mouse.cursor("default");
    lab.tooltip.dspText();
  });

  /* Installe le potentiometre ou le positionne à sa place.
  Gère la création et l'affichage de la courbe */
  potentiometre.fond.bind("dblclick", function () {
    return dbClicHandler(G, potentiometre, lab.becher, 3)
  })

  return potentiometre;
}

export { initPotentiometre };
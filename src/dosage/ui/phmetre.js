

import { Appareil } from "./appareil.js"
import { PHMETRE } from "./interface.js"
import { cts } from "../../environnement/constantes.js";
import * as txt from "./lang_fr.js";
import { isObject } from "../../modules/utils/type.js";
import * as e from "../../modules/utils/errors.js";
import { dbClicHandler } from "./appareil.js"

/**
 * @typedef {import ('../../../types/types').tAPPAREIL} tAPPAREIL
 * @typedef {import ('../../../types/classes').Canvas} Canvas
 * @typedef {import('../../../types/interfaces').iCanvasText} iCanvasText
 */

/**  Création phmetre
 *
 * @class Phmetre
*/
class Phmetre extends Appareil {
  /**
   * 
   * @param {tAPPAREIL} app 
   * @param {Canvas} canvas 
   * @param {string} unite 
   */
  constructor(app, canvas, unite) {
    super(app, canvas, unite, 1)

    /** @type {iCanvasText} */
    this.value = canvas.display.text({
      x: 5 * app.w / 6 - 20,
      y: app.h / 2 + 6,
      size: app.w / 10,
      text: app.value,
      fill: "#0",
      origin: { x: "center", y: "center" },
    })

    this.fond.addChild(this.value)
  }
}

/** initPhmetre.js 
 * 
 * @module dosage/ui/initPhmetre
 * @description 
 * - Crée le phmètre et définit les events
 * - Positionne et actualise l'afiichage
 * ***
 * ***export initPhmetre ***
*/

/**
 * @typedef {import('../../../types/classes').Lab} Lab
 * @typedef {import('../../../types/classes').Dosage} Dosage
 * @typedef {import('../../../types/classes').Becher} Becher
 * 
 */

/** Crée le Phmètre
 * 
 * Définit les events
 * 
 * @param {Lab} lab Labo
 * @param {Dosage} G 
 * @returns {Phmetre} Phmetre
 * @use updGraph, displayGraph
 * @public
 * @file Phmetre.js
 */
function initPhmetre(G, lab) {
  if (!isObject(lab.canvas) || !isObject(lab.tooltip) || !isObject(lab.becher)) throw new TypeError(e.ERROR_OBJ)

  // Crée phmetre
  var phmetre = new Phmetre(PHMETRE, lab.canvas, "");
  lab.canvas.addChild(phmetre.fond);

  // survol pHmetre
  phmetre.fond.bind("mouseenter", function () {
    if (G.type & cts.TYPE_ACIDEBASE && G.mesure & 1) {
      lab.canvas.mouse.cursor("pointer");
      lab.tooltip.dspText(txt.DO_PHMETRE);
    } else {
      lab.canvas.mouse.cursor("not-allowed");
    }
  });

  // Quitte survol pHmetre
  phmetre.fond.bind("mouseleave", function () {
    lab.canvas.mouse.cursor("default");
    if (G.type & cts.TYPE_ACIDEBASE && G.mesure & 1) {
      lab.tooltip.dspText();
    }
  });

  /* Installe le pHmètre ou le positionne à sa place.
    Gère la création et l'affichage de la courbe */
  phmetre.fond.bind("dblclick", function () {
    return dbClicHandler(G, phmetre, lab.becher)
  })


  return phmetre
}

export { initPhmetre, Phmetre }
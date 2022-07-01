/**
 * @module dosage/ui/initAgitateur
 * @description Crée un objet agitateur
 * ***
 * ***export initAgitateur***
 */

import { isObject } from "../../modules/utils/type.js";
import * as E from "../../modules/utils/errors.js"

/**
 * @typedef {import ('../../../types/classes').Canvas} Canvas
 * @typedef {import('../../../types/interfaces').iCanvasImage} iCanvasImage
 * @typedef {import ('../../../types/types').tAGITATEUR} tAGITATEUR
 */

/**
 * @class Agitateur
 * @classdesc construit l'objet agitateur
  */
class Agitateur {
  /**
  * 
  * @param {tAGITATEUR} sagitateur données agitateur   
  * @param {Canvas} canvas canvas
   */
  constructor(sagitateur, canvas) {
    this.canvas = canvas
    this.sagitateur = sagitateur

    this.fond = canvas.display.image({
      x: sagitateur.x,
      y: sagitateur.y,
      width: sagitateur.w,
      height: sagitateur.h,
      image: sagitateur.image,
      zindex: "back"
    })
  }
}

export { Agitateur }
/**
 * Initie Agitateur
 * @param {Canvas} canvas Canvas
 * @param {tAGITATEUR} sAgitateur
 * @returns {Agitateur}
 *
 * @file initAgitateur.js
 */
function initAgitateur(canvas, sAgitateur) {
  if (!isObject(canvas)) E.debugError(E.ERROR_OBJ);

  const agitateur = new Agitateur(sAgitateur, canvas);
  canvas.addChild(agitateur.sagitateur);
  return agitateur;
}

export { initAgitateur }
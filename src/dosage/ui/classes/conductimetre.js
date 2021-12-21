import {Appareil} from "./appareil.js"

/**
 * @typedef {import ('../../../../types/classes').Canvas} Canvas
 * @typedef {import ('../../../../types/types').tAPPAREIL} tAPPAREIL
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
   * @param {number} etat 
   * @param {string} unite 
   */
  constructor(app, canvas, etat, unite){
    super(app, canvas, etat, unite)

    this.fond.addChild(this.value)
  }
}

export {Conductimetre}
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

    this.valeur = canvas.display.text({
      x: app.w/2+12,
      y: app.h/2-24,
      size: app.w/9,
      text: app.value,
      fill: "#0",
      origin: {x:"center",y:"center"}
    })

    this.fond.addChild(this.valeur)
  }
}

export {Conductimetre}